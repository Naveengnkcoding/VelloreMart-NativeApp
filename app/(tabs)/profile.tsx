import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LoginModal from '../../components/LoginModal';
import RegisterModal from '../../components/RegisterModal';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

export default function ProfileScreen() {
  const { t } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const { items } = useCart();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

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
      </View>

      <View style={styles.center}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#9ca3af" />
        </View>
        <Text style={styles.title}>{profile?.name || user.email}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.info}>📞 {profile?.phone}</Text>
          <Text style={styles.info}>📍 {profile?.address}</Text>
          {profile?.alternate_phone && <Text style={styles.info}>📞2 {profile.alternate_phone}</Text>}
        </View>

        <TouchableOpacity onPress={signOut} style={styles.logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    backgroundColor: '#008b1d',
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  logoImg: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },

  center: { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#e5e7eb',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
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

  infoBox: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  info: { fontSize: 14, color: '#374151' },

  logout: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 12,
  },
  logoutText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});