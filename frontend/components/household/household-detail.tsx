import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Household, UpdateHouseholdInput } from '@/lib/graphql/types';
import { updateHousehold, leaveHousehold } from '@/lib/graphql/mutations/households';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ChoresManager } from '@/components/chores/chores-manager';

interface HouseholdDetailProps {
  household: Household;
  onUpdate?: () => void;
}

type TabType = 'overview' | 'chores';

export function HouseholdDetail({ household, onUpdate }: HouseholdDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateHouseholdInput>({
    name: household.name,
    description: household.description || '',
    address: household.address || '',
    rentAmount: household.rentAmount,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      await updateHousehold(household.id, editData);
      setIsEditing(false);
      Alert.alert('Success', 'Household updated successfully');
      onUpdate?.();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update household');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave Household',
      'Are you sure you want to leave this household?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveHousehold(household.id);
              Alert.alert('Success', 'You have left the household');
              router.replace('/dashboard');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to leave household');
            }
          },
        },
      ]
    );
  };

  const copyInviteCode = async () => {
    try {
      await Clipboard.setStringAsync(household.inviteCode);
      Alert.alert('Success', 'Invite code copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy invite code');
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}
        >
          <IconSymbol name="house" size={20} color={activeTab === 'overview' ? '#007AFF' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chores' && styles.tabActive]}
          onPress={() => setActiveTab('chores')}
        >
          <IconSymbol name="list.bullet.clipboard" size={20} color={activeTab === 'chores' ? '#007AFF' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'chores' && styles.tabTextActive]}>
            Chores
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'overview' ? (
        <ScrollView style={styles.content}>
          {/* Household Info Section */}
          <View style={styles.section}>
            <View style={styles.infoCard}>
              <View style={styles.headerRow}>
                <Text style={styles.householdName}>{household.name}</Text>
                <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
                  <IconSymbol name="pencil" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
          {household.description && (
            <Text style={styles.description}>{household.description}</Text>
          )}
          {household.address && (
            <Text style={styles.address}>📍 {household.address}</Text>
          )}
          {household.rentAmount && (
            <Text style={styles.rent}>
              💰 {household.currency || 'USD'} {household.rentAmount}/month
            </Text>
          )}
          {household.householdType && (
            <Text style={styles.type}>🏠 {household.householdType}</Text>
          )}
        </View>
      </View>

      {/* Invite Code Section */}
      <View style={styles.section}>
        <TouchableOpacity onPress={copyInviteCode} style={styles.inviteCodeCard}>
          <Text style={styles.inviteCodeLabel}>Share this code with others:</Text>
          <Text style={styles.inviteCode}>{household.inviteCode}</Text>
          <Text style={styles.inviteCodeHint}>Tap to copy</Text>
        </TouchableOpacity>
      </View>

      {/* Roommates Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Roommates ({household.roommates?.length || 0})
        </Text>
        {!household.roommates || household.roommates.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No roomies. Invite them!</Text>
          </View>
        ) : (
          <View style={styles.roommatesList}>
            {household.roommates.map((roommate) => (
              <View key={roommate.id} style={styles.roommateCard}>
                {roommate.profile.avatarUrl ? (
                  <Image
                    source={{ uri: roommate.profile.avatarUrl }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarText}>
                      {roommate.profile.fullName?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
                <View style={styles.roommateInfo}>
                  <Text style={styles.roommateName}>
                    {roommate.profile.fullName || 'Unknown'}
                  </Text>
                  {roommate.profile.bio && (
                    <Text style={styles.roommateBio} numberOfLines={2}>
                      {roommate.profile.bio}
                    </Text>
                  )}
                </View>
                <View style={styles.roommatePoints}>
                  <Text style={styles.roommatePointsText}>
                    ⭐ {roommate.points ?? 0} pts
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

          {/* Leave Household Button */}
          <TouchableOpacity onPress={handleLeave} style={styles.leaveButton}>
            <Text style={styles.leaveButtonText}>Leave Household</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ChoresManager 
          householdId={household.id} 
          roommates={household.roommates || []} 
        />
      )}

      {/* Edit Modal */}
      <Modal
        visible={isEditing}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditing(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsEditing(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Household</Text>
            <TouchableOpacity onPress={handleSave} disabled={isUpdating}>
              {isUpdating ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <Text style={styles.modalSave}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                value={editData.name}
                onChangeText={(text) => setEditData({ ...editData, name: text })}
                placeholder="Household name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editData.description}
                onChangeText={(text) => setEditData({ ...editData, description: text })}
                placeholder="Description"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={styles.input}
                value={editData.address}
                onChangeText={(text) => setEditData({ ...editData, address: text })}
                placeholder="Address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rent Amount</Text>
              <TextInput
                style={styles.input}
                value={editData.rentAmount?.toString() || ''}
                onChangeText={(text) => setEditData({ ...editData, rentAmount: parseFloat(text) || undefined })}
                placeholder="Rent amount"
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  editButton: {
    padding: 8,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  householdName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    lineHeight: 22,
  },
  address: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  rent: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  type: {
    fontSize: 14,
    color: '#444',
  },
  inviteCodeCard: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  inviteCodeLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  inviteCode: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 8,
  },
  inviteCodeHint: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  roommatesList: {
    gap: 12,
  },
  roommateCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  roommateInfo: {
    flex: 1,
  },
  roommatePoints: {
    alignItems: 'flex-end',
  },
  roommatePointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7CB342',
  },
  roommateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  roommateBio: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  leaveButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalCancel: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
