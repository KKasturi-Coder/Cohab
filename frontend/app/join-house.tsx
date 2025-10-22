import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { auth, houses } from '@/lib/supabase-helpers';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function JoinCreateHouseScreen() {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [houseName, setHouseName] = useState('');
  const [address, setAddress] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [houseCode, setHouseCode] = useState('');

  const handleCreateHouse = async () => {
    if (!houseName.trim() || !address.trim() || !rentAmount.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // Get current user
      const user = await auth.getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Please sign in first');
        return;
      }

      // Create house
      const { data, error } = await houses.createHouse({
        name: houseName.trim(),
        address: address.trim(),
        rentAmount: parseFloat(rentAmount),
        currency: 'USD',
        createdBy: user.id
      });

      if (error) {
        Alert.alert('Error', `Failed to create house: ${error.message}`);
        return;
      }

      Alert.alert('Success', 'House created successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/dashboard')
        }
      ]);

    } catch (error: any) {
      Alert.alert('Error', `Failed to create house: ${error.message}`);
    }
  };

  const handleJoinHouse = async () => {
    if (!houseCode.trim()) {
      Alert.alert('Error', 'Please enter a house code');
      return;
    }

    try {
      // Get current user
      const user = await auth.getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Please sign in first');
        return;
      }

      // Join house
      const { data, error } = await houses.joinHouse(houseCode.trim(), user.id);

      if (error) {
        Alert.alert('Error', `Failed to join house: ${error.message}`);
        return;
      }

      Alert.alert('Success', 'House join request sent! Waiting for approval.', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/dashboard')
        }
      ]);

    } catch (error: any) {
      Alert.alert('Error', `Failed to join house: ${error.message}`);
    }
  };

  return (
    <LinearGradient
      colors={['#F0F8E8', '#E8F4FD']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Set Up Your House
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Create a new house or join an existing one
        </ThemedText>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.activeTab]}
          onPress={() => setActiveTab('create')}
        >
          <IconSymbol name="plus.circle.fill" size={20} color={activeTab === 'create' ? '#FFFFFF' : '#666666'} />
          <ThemedText style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
            Create House
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'join' && styles.activeTab]}
          onPress={() => setActiveTab('join')}
        >
          <IconSymbol name="person.2.fill" size={20} color={activeTab === 'join' ? '#FFFFFF' : '#666666'} />
          <ThemedText style={[styles.tabText, activeTab === 'join' && styles.activeTabText]}>
            Join House
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Form Content */}
      <View style={styles.formContainer}>
        {activeTab === 'create' ? (
          <View style={styles.form}>
            <ThemedText type="subtitle" style={styles.formTitle}>
              Create Your House
            </ThemedText>
            <ThemedText style={styles.formDescription}>
              Set up your shared living space and invite roommates
            </ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>House Name</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="e.g., Park Place Apartment"
                value={houseName}
                onChangeText={setHouseName}
                placeholderTextColor="#999999"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Address</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="e.g., 123 Main St, City, State"
                value={address}
                onChangeText={setAddress}
                placeholderTextColor="#999999"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Monthly Rent</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2500"
                value={rentAmount}
                onChangeText={setRentAmount}
                keyboardType="numeric"
                placeholderTextColor="#999999"
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleCreateHouse}>
              <ThemedText style={styles.primaryButtonText}>Create House</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <ThemedText type="subtitle" style={styles.formTitle}>
              Join Existing House
            </ThemedText>
            <ThemedText style={styles.formDescription}>
              Enter the house code provided by your roommate
            </ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>House Code</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="e.g., ABC123"
                value={houseCode}
                onChangeText={setHouseCode}
                placeholderTextColor="#999999"
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleJoinHouse}>
              <ThemedText style={styles.primaryButtonText}>Join House</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          You can always change houses later in settings
        </ThemedText>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#7CB342',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  primaryButton: {
    backgroundColor: '#7CB342',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});
