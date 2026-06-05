import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LoginModal from '../../components/LoginModal';
import RegisterModal from '../../components/RegisterModal';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

export default function ProfileScreen() {
  const { t } = useLanguage();
  const { user, profile, signOut, fetchProfile, upsertCustomer, activateCustomer } = useAuth();
  const { items } = useCart();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);

  const deletedDate = profile?.deleted || null;
  const deactivatedAt = deletedDate ? new Date(deletedDate) : null;
  const deactivatedDays = deactivatedAt? Math.floor((Date.now() - deactivatedAt.getTime()) / (1000 * 60 * 60 * 24)): 0;
  const daysRemaining = Math.max(0, 30 - deactivatedDays);
  const isDeactivated = Boolean(deletedDate);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setAlternatePhone(profile.alternate_phone || '');
      setAddress(profile.address || '');
      setEditing(false);
    } else if (user) {
      setName('');
      setPhone('');
      setAlternatePhone('');
      setAddress('');
      setEditing(true);
    }
  }, [profile, user]);

  const saveProfile = async () => {
    if (!user) return;
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Validation', 'Please fill in name, phone and address.');
      return;
    }

    setSaving(true);
    const payload = {
      id: user.id,
      email: user.email,
      name: name.trim(),
      phone: phone.trim(),
      alternate_phone: alternatePhone.trim() || null,
      address: address.trim(),
      deleted: null,
    };

    const { error } = await upsertCustomer(payload);
    setSaving(false);

    if (error) {
      Alert.alert('Save failed', error.message);
      return;
    }

    if (fetchProfile) await fetchProfile(user.id);
    Alert.alert('Saved', 'Your profile has been updated.');
    setEditing(false);
  };

  const activateAccount = async () => {
    if (!user) return;
    setActivating(true);
    const { error } = await activateCustomer(user.id);
    setActivating(false);
    if (error) {
      Alert.alert('Activation failed', error.message);
      return;
    }
    if (fetchProfile) await fetchProfile(user.id);
    Alert.alert('Activated', 'Your account is active again.');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Image source={require('../../assets/images/icon.png')} style={styles.logoImg} />
            </View>
            <Text style={styles.headerTitle}>{t.appName}</Text>
          </View>
        </View>

        <View style={styles.center}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#9ca3af" />
          </View>
          <Text style={styles.title}>{t.profile}</Text>
          <Text style={styles.sub}>{t.pleaseLogin}</Text>
          {items.length > 0 && <Text style={styles.hint}>{t.cartHasItems}</Text>}

          <View style={styles.row}>
            <TouchableOpacity onPress={() => setShowLogin(true)} style={styles.loginBtn}>
              <Text style={styles.loginText}>{t.login}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowRegister(true)} style={styles.registerBtn}>
              <Text style={styles.registerText}>{t.register}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <LoginModal
          visible={showLogin}
          onClose={() => setShowLogin(false)}
          onSwitchRegister={() => { setShowLogin(false); setShowRegister(true); }}
        />
        <RegisterModal
          visible={showRegister}
          onClose={() => setShowRegister(false)}
          onSwitchLogin={() => { setShowRegister(false); setShowLogin(true); }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Image source={require('../../assets/images/icon.png')} style={styles.logoImg} />
          </View>
          <Text style={styles.headerTitle}>{t.appName}</Text>
        </View>
        {!isDeactivated && (
          <TouchableOpacity onPress={() => setEditing((prev) => !prev)} style={styles.editBtn}>
            <Ionicons name={editing ? 'checkmark' : 'pencil'} size={18} color="#fff" />
            <Text style={styles.editBtnText}>{editing ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.profileCard}>
          <View style={styles.profileHead}>
            <View style={styles.avatarLarge}>
              <Ionicons name="person" size={42} color="#fff" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.name || user.email}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
          </View>

          {isDeactivated && (
            <View style={styles.alertBox}>
              <Text style={styles.alertTitle}>Your account is deactivated.</Text>
              <Text style={styles.alertText}>
                It is Deactivated {deactivatedDays} days ago on {deactivatedAt?.toLocaleDateString()}. Click activate to restore your account.
              </Text>
              <Text style={styles.alertText}>
                Recover it within 30 days — your data will be permanently deleted after {daysRemaining} day{daysRemaining === 1 ? '' : 's'}.
              </Text>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              editable={!isDeactivated && editing}
              value={name}
              onChangeText={setName}
              placeholder="Name"
              style={[styles.fieldInput, isDeactivated && styles.fieldDisabled]}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              editable={false}
              value={user.email || ''}
              style={[styles.fieldInput, styles.fieldDisabled]}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Phone</Text>
            <TextInput
              editable={!isDeactivated && editing} // 
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone"
              maxLength={10}  
              keyboardType="phone-pad"
              style={[styles.fieldInput, isDeactivated && styles.fieldDisabled]}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Alternate Phone</Text>
            <TextInput
              editable={!isDeactivated && editing}
              value={alternatePhone}
              onChangeText={setAlternatePhone}
              placeholder="Alternate Phone"
              maxLength={10}
              keyboardType="phone-pad"
              style={[styles.fieldInput, isDeactivated && styles.fieldDisabled]}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Address</Text>
            <TextInput
              editable={!isDeactivated && editing}
              value={address}
              onChangeText={setAddress}
              placeholder="Address"
              multiline
              numberOfLines={4}
              style={[styles.fieldInput, styles.addressInput, isDeactivated && styles.fieldDisabled]}
            />
            <TextInput
              editable={false}
              value={ 'Vellore, Tamil Nadu'}
              style={[styles.fieldInput,styles.fieldtn, styles.fieldDisabled]}
            />
          </View>

          {!isDeactivated && editing && (
            <TouchableOpacity onPress={saveProfile} style={styles.saveBtn} disabled={saving}>
              <Text style={styles.saveText}>{saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}</Text>
            </TouchableOpacity>
          )}

          {isDeactivated && (
            <TouchableOpacity onPress={activateAccount} style={styles.activateBtn} disabled={activating}>
              <Text style={styles.activateText}>{activating ? 'Activating...' : 'Activate account'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={signOut} style={styles.logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    backgroundColor: '#008b1d',
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImg: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  editBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  scrollContent: { paddingBottom: 40 },
  content: { flex: 1, padding: 16 },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  profileHead: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 20 },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#008b1d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '800', color: '#111' },
  profileEmail: { fontSize: 14, color: '#6b7280', marginTop: 4 },

  alertBox: {
    backgroundColor: '#ecfdf5',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  alertTitle: { color: '#166534', fontSize: 15, fontWeight: '800', marginBottom: 8 },
  alertText: { color: '#14532d', fontSize: 13, lineHeight: 20 },

  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, color: '#4b5563', marginBottom: 6 },
  fieldInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fieldtn: {backgroundColor: '#e5e7eb', color: '#9ca3af', marginTop: 8},
  addressInput: { minHeight: 90, textAlignVertical: 'top' },
  fieldDisabled: { backgroundColor: '#f3f4f6', color: '#9ca3af' },

  saveBtn: {
    backgroundColor: '#008b1d',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  activateBtn: {
    backgroundColor: '#059669',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  activateText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  logout: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  center: { flex: 1, alignItems: 'center', paddingTop: 200, paddingHorizontal: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 6 },
  sub: { fontSize: 15, color: '#6b7280', marginBottom: 8 },
  hint: { fontSize: 14, color: '#008b1d', marginBottom: 24, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 12, marginTop: 8 },
  loginBtn: {
    backgroundColor: '#008b1d',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  loginText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  registerBtn: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  registerText: { color: '#374151', fontSize: 15, fontWeight: '700' },
});