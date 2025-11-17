import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { auth } from '@/lib/supabase-helpers';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import Animated, { FadeInDown, FadeInUp, useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { updateProfile } from '@/lib/graphql-client';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userBio, setUserBio] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Payment settings
  const [showPaymentSettings, setShowPaymentSettings] = useState(false);
  const [venmoHandle, setVenmoHandle] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [cashappHandle, setCashappHandle] = useState('');
  const [zelleEmail, setZelleEmail] = useState('');
  const [preferredMethod, setPreferredMethod] = useState<'venmo' | 'paypal' | 'cashapp' | 'zelle' | null>(null);
  
  const avatarScale = useSharedValue(0);
  
  const animatedAvatarStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: avatarScale.value }],
    };
  });

  useEffect(() => {
    // Check authentication first
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }
      
      // Get user info
      const user = await auth.getCurrentUser();
      if (user) {
        setUserEmail(user.email || '');
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        const bio = user.user_metadata?.bio || '';
        setUserName(name);
        setUserBio(bio);
        setEditedName(name);
        setEditedBio(bio);
        
        // Load payment settings from profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('venmo_handle, paypal_email, cashapp_handle, zelle_email, preferred_payment_method')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          const profile = profileData as any;
          setVenmoHandle(profile.venmo_handle || '');
          setPaypalEmail(profile.paypal_email || '');
          setCashappHandle(profile.cashapp_handle || '');
          setZelleEmail(profile.zelle_email || '');
          setPreferredMethod(profile.preferred_payment_method || null);
        }
      }
      
      setIsCheckingAuth(false);
      
      // Trigger avatar animation
      avatarScale.value = withSpring(1, {
        duration: 800,
        dampingRatio: 0.6,
      });
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

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit
      setEditedName(userName);
      setEditedBio(userBio);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateProfile({
        fullName: editedName.trim(),
        bio: editedBio.trim(),
      });

      if (result) {
        setUserName(editedName.trim());
        setUserBio(editedBio.trim());
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePaymentSettings = async () => {
    // Validate at least one payment method is set
    if (!venmoHandle && !paypalEmail && !cashappHandle && !zelleEmail) {
      Alert.alert('Info', 'Add at least one payment method so roommates can pay you.');
      return;
    }

    // Validate preferred method is set if user has methods
    const hasMethod = venmoHandle || paypalEmail || cashappHandle || zelleEmail;
    if (hasMethod && !preferredMethod) {
      Alert.alert('Select Preferred Method', 'Choose which payment app you prefer to use.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateProfile({
        venmoHandle: venmoHandle || undefined,
        paypalEmail: paypalEmail || undefined,
        cashappHandle: cashappHandle || undefined,
        zelleEmail: zelleEmail || undefined,
        preferredPaymentMethod: preferredMethod || undefined,
      });

      if (result) {
        setShowPaymentSettings(false);
        Alert.alert('Success', 'Payment settings updated! Roommates can now pay you.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update payment settings');
      console.error('Payment settings error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await auth.signOut();
              if (error) {
                Alert.alert('Error', error.message);
              } else {
                router.replace('/');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (isCheckingAuth) {
    return (
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFC125" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100).duration(600)} style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <ThemedText type="title" style={styles.headerTitle}>Profile</ThemedText>
        </Animated.View>

        {/* User Info Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Animated.View style={[styles.avatar, animatedAvatarStyle]}>
              <IconSymbol name="person.fill" size={40} color="#FFC125" />
            </Animated.View>
          </View>
          
          {isEditing ? (
            <>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Name</ThemedText>
                <TextInput
                  style={styles.input}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Enter your name"
                  placeholderTextColor="#999999"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Bio</ThemedText>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={editedBio}
                  onChangeText={setEditedBio}
                  placeholder="Tell us about yourself"
                  placeholderTextColor="#999999"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleEditToggle}
                  disabled={isSaving}
                >
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton, isSaving && styles.saveButtonDisabled]}
                  onPress={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <ThemedText style={styles.saveButtonText}>Save</ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <ThemedText type="subtitle" style={styles.userName}>{userName}</ThemedText>
              <ThemedText style={styles.userEmail}>{userEmail}</ThemedText>
              {userBio ? (
                <ThemedText style={styles.userBio}>{userBio}</ThemedText>
              ) : null}
              
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditToggle}
              >
                <IconSymbol name="pencil" size={16} color="#FFC125" />
                <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

        {/* Payment Settings */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <TouchableOpacity
            style={styles.settingsCard}
            onPress={() => setShowPaymentSettings(!showPaymentSettings)}
          >
            <View style={styles.settingsHeader}>
              <View style={styles.settingsHeaderLeft}>
                <IconSymbol name="dollarsign.circle.fill" size={24} color="#FFC125" />
                <ThemedText style={styles.settingsTitle}>Payment Settings</ThemedText>
              </View>
              <IconSymbol 
                name={showPaymentSettings ? "chevron.up" : "chevron.down"} 
                size={20} 
                color="#FFC125" 
              />
            </View>
            
            {showPaymentSettings && (
              <View style={styles.paymentContent}>
                <ThemedText style={styles.paymentDescription}>
                  Add your payment info so roommates can easily pay you back for shared expenses.
                </ThemedText>
                
                {/* Venmo */}
                <View style={styles.paymentInputGroup}>
                  <ThemedText style={styles.paymentLabel}>💜 Venmo Username</ThemedText>
                  <TextInput
                    style={styles.paymentInput}
                    value={venmoHandle}
                    onChangeText={(text) => setVenmoHandle(text.replace('@', ''))}
                    placeholder="johndoe (without @)"
                    placeholderTextColor="#666"
                    autoCapitalize="none"
                  />
                </View>

                {/* PayPal */}
                <View style={styles.paymentInputGroup}>
                  <ThemedText style={styles.paymentLabel}>💙 PayPal Email</ThemedText>
                  <TextInput
                    style={styles.paymentInput}
                    value={paypalEmail}
                    onChangeText={setPaypalEmail}
                    placeholder="john@example.com"
                    placeholderTextColor="#666"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Cash App */}
                <View style={styles.paymentInputGroup}>
                  <ThemedText style={styles.paymentLabel}>💚 Cash App $Cashtag</ThemedText>
                  <TextInput
                    style={styles.paymentInput}
                    value={cashappHandle}
                    onChangeText={(text) => setCashappHandle(text.replace('$', ''))}
                    placeholder="johndoe (without $)"
                    placeholderTextColor="#666"
                    autoCapitalize="none"
                  />
                </View>

                {/* Zelle */}
                <View style={styles.paymentInputGroup}>
                  <ThemedText style={styles.paymentLabel}>⚡ Zelle Email/Phone</ThemedText>
                  <TextInput
                    style={styles.paymentInput}
                    value={zelleEmail}
                    onChangeText={setZelleEmail}
                    placeholder="john@example.com or phone"
                    placeholderTextColor="#666"
                    autoCapitalize="none"
                  />
                </View>

                {/* Preferred Method */}
                {(venmoHandle || paypalEmail || cashappHandle || zelleEmail) && (
                  <View style={styles.paymentInputGroup}>
                    <ThemedText style={styles.paymentLabel}>⭐ Preferred Method</ThemedText>
                    <View style={styles.preferredMethodButtons}>
                      {venmoHandle && (
                        <TouchableOpacity
                          style={[styles.methodButton, preferredMethod === 'venmo' && styles.methodButtonActive]}
                          onPress={() => setPreferredMethod('venmo')}
                        >
                          <ThemedText style={[styles.methodButtonText, preferredMethod === 'venmo' && styles.methodButtonTextActive]}>
                            Venmo
                          </ThemedText>
                        </TouchableOpacity>
                      )}
                      {paypalEmail && (
                        <TouchableOpacity
                          style={[styles.methodButton, preferredMethod === 'paypal' && styles.methodButtonActive]}
                          onPress={() => setPreferredMethod('paypal')}
                        >
                          <ThemedText style={[styles.methodButtonText, preferredMethod === 'paypal' && styles.methodButtonTextActive]}>
                            PayPal
                          </ThemedText>
                        </TouchableOpacity>
                      )}
                      {cashappHandle && (
                        <TouchableOpacity
                          style={[styles.methodButton, preferredMethod === 'cashapp' && styles.methodButtonActive]}
                          onPress={() => setPreferredMethod('cashapp')}
                        >
                          <ThemedText style={[styles.methodButtonText, preferredMethod === 'cashapp' && styles.methodButtonTextActive]}>
                            Cash App
                          </ThemedText>
                        </TouchableOpacity>
                      )}
                      {zelleEmail && (
                        <TouchableOpacity
                          style={[styles.methodButton, preferredMethod === 'zelle' && styles.methodButtonActive]}
                          onPress={() => setPreferredMethod('zelle')}
                        >
                          <ThemedText style={[styles.methodButtonText, preferredMethod === 'zelle' && styles.methodButtonTextActive]}>
                            Zelle
                          </ThemedText>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.savePaymentButton, isSaving && styles.savePaymentButtonDisabled]}
                  onPress={handleSavePaymentSettings}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <ThemedText style={styles.savePaymentButtonText}>Save Payment Settings</ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <TouchableOpacity 
            style={[styles.logoutButton, loading && styles.logoutButtonDisabled]} 
            onPress={handleLogout}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <IconSymbol name="arrow.right.square.fill" size={20} color="#FFFFFF" />
                <ThemedText style={styles.logoutButtonText}>Sign Out</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFC125',
  },
  userCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#FFC125',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.2)',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFC125',
    marginBottom: 8,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: '#D4AF37',
    textAlign: 'center',
  },
  userBio: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FFC125',
  },
  editButtonText: {
    color: '#FFC125',
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFC125',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.3)',
  },
  bioInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.3)',
  },
  cancelButtonText: {
    color: '#D4AF37',
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#1E3A8A',
    borderWidth: 1,
    borderColor: '#FFC125',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#DC3545',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.2)',
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFC125',
  },
  paymentContent: {
    marginTop: 20,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
    lineHeight: 20,
  },
  paymentInputGroup: {
    marginBottom: 16,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFC125',
    marginBottom: 8,
  },
  paymentInput: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.3)',
  },
  preferredMethodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  methodButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#555',
  },
  methodButtonActive: {
    backgroundColor: '#FFC125',
    borderColor: '#FFC125',
  },
  methodButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  methodButtonTextActive: {
    color: '#000',
  },
  savePaymentButton: {
    backgroundColor: '#FFC125',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  savePaymentButtonDisabled: {
    opacity: 0.6,
  },
  savePaymentButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

