import React, { useEffect, useState, useRef } from 'react';
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
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getCurrentHousehold, UpdateHouseholdInput } from '@/lib/graphql-client';
import { updateHousehold, leaveHousehold } from '@/lib/graphql/mutations/households';
import { Household } from '@/lib/graphql/types';
import { supabase } from '@/lib/supabase';

export default function GroupScreen() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateHouseholdInput | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const amenityInputRef = useRef<TextInput>(null);

  const loadHousehold = async () => {
    try {
      setLoading(true);
      const houseData = await getCurrentHousehold();
      if (houseData) {
        setHousehold(houseData);
        setEditData({
          name: houseData.name,
          description: houseData.description || '',
          address: houseData.address || '',
          rentAmount: houseData.rentAmount,
          currency: houseData.currency,
          householdType: houseData.householdType,
          amenities: houseData.amenities || [],
          images: houseData.images || [],
          isAvailable: houseData.isAvailable,
        });
      }
    } catch (error) {
      console.error('Error loading household:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }
      setIsCheckingAuth(false);
      await loadHousehold();
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!household || !editData) return;
    
    try {
      setIsUpdating(true);
      await updateHousehold(household.id, editData);
      setIsEditing(false);
      Alert.alert('Success', 'Household updated successfully');
      await loadHousehold();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update household');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLeave = () => {
    if (!household) return;
    
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
              const result = await leaveHousehold(household.id);
              if (result.success) {
                if (result.remainingHouseholds.length === 0) {
                  Alert.alert(
                    'Left Household',
                    'You have left the household. Would you like to join or create a new one?',
                    [
                      {
                        text: 'Yes, take me there',
                        onPress: () => router.replace('/join-house'),
                      },
                    ]
                  );
                } else {
                  Alert.alert('Success', 'You have left the household');
                  router.replace('/(tabs)/dashboard');
                }
              } else {
                throw new Error('Failed to leave household');
              }
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to leave household');
            }
          },
        },
      ]
    );
  };

  const copyInviteCode = async () => {
    if (!household) return;
    
    try {
      await Clipboard.setStringAsync(household.inviteCode);
      Alert.alert('Success', 'Invite code copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy invite code');
    }
  };

  if (isCheckingAuth || loading) {
    return (
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFC125" />
          <ThemedText>Loading household...</ThemedText>
        </View>
      </LinearGradient>
    );
  }

  if (!household) {
    return (
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.errorText}>No household found</ThemedText>
          <ThemedText style={styles.errorSubtext}>
            Please join or create a household to view group details
          </ThemedText>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Household Info Section */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <View style={styles.headerRow}>
              <Text style={styles.householdName}>{household.name}</Text>
              <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
                <IconSymbol name="pencil" size={20} color="#FFC125" />
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
        
        {/* Bottom padding */}
        <View style={{ height: 20 }} />
      </ScrollView>

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
                <ActivityIndicator color="#FFC125" />
              ) : (
                <Text style={styles.modalSave}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {editData && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name *</Text>
                  <TextInput
                    style={[styles.input, isFocused === 'name' && styles.inputFocused]}
                    value={editData.name}
                    onChangeText={(text) => setEditData({ ...editData, name: text })}
                    placeholder="Household name"
                    placeholderTextColor="#999"
                    onFocus={() => setIsFocused('name')}
                    onBlur={() => setIsFocused(null)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={editData.description}
                    onChangeText={(text) => setEditData({ ...editData, description: text })}
                    placeholder="Description"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Address</Text>
                  <TextInput
                    style={[styles.input, isFocused === 'address' && styles.inputFocused]}
                    value={editData.address}
                    onChangeText={(text) => setEditData({ ...editData, address: text })}
                    placeholder="Address"
                    placeholderTextColor="#999"
                    onFocus={() => setIsFocused('address')}
                    onBlur={() => setIsFocused(null)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Rent Amount</Text>
                  <View style={styles.amountRow}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginRight: 8 }]}
                      value={editData.rentAmount?.toString() || ''}
                      onChangeText={(text) => setEditData({ ...editData, rentAmount: parseFloat(text) || undefined })}
                      placeholder="Rent amount"
                      keyboardType="numeric"
                    />
                    <View style={[styles.input, styles.currencyInput]}>
                      <Text>{editData.currency || 'USD'}</Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFC125',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#D4AF37',
    textAlign: 'center',
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
    color: '#FFC125',
    marginBottom: 12,
  },
  editButton: {
    padding: 8,
  },
  infoCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#FFC125',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.2)',
  },
  householdName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFC125',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#D4AF37',
    marginBottom: 12,
    lineHeight: 22,
  },
  address: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  rent: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  type: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  inviteCodeCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFC125',
  },
  inviteCodeLabel: {
    fontSize: 14,
    color: '#FFC125',
    opacity: 0.9,
    marginBottom: 8,
  },
  inviteCode: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFC125',
    letterSpacing: 4,
    marginBottom: 8,
  },
  inviteCodeHint: {
    fontSize: 12,
    color: '#D4AF37',
    opacity: 0.9,
  },
  roommatesList: {
    gap: 12,
  },
  roommateCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#FFC125',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#1E3A8A',
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
    color: '#FFC125',
  },
  roommateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  roommateBio: {
    fontSize: 14,
    color: '#D4AF37',
  },
  emptyState: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.2)',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#D4AF37',
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
    color: '#FFC125',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFC125',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  inputFocused: {
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyInput: {
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

