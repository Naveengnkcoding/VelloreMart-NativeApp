import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

function GoogleIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export default function LoginModal({ visible, onClose, onSwitchRegister }: any) {
  const router = useRouter();
  const { t } = useLanguage();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      onClose();
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
  setLoading(true);
  try {
    await signInWithGoogle(); // This now triggers the native popup
    onClose(); // Close modal
  } catch (e: any) {
    setError(e.message || 'Google sign-in failed');
  }
  setLoading(false);
};
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity onPress={onClose} style={styles.close}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>

          <Text style={styles.title}>{t.login}</Text>

          <TouchableOpacity onPress={handleGoogle} style={styles.google}>
            {/* <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }} style={styles.gIcon} /> */}
            <GoogleIcon/>
            <Text style={styles.gText}>{t.continueGoogle}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.or}>{t.or}</Text>
            <View style={styles.line} />
          </View>

          <TextInput style={styles.input} placeholder={t.email} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={styles.input} placeholder={t.password} value={password} onChangeText={setPassword} secureTextEntry />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity onPress={handleLogin} style={styles.btn}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t.login}</Text>}
          </TouchableOpacity>

          <Text style={styles.footer}>
            {t.noAccount} <Text onPress={onSwitchRegister} style={styles.link}>{t.registerNow}</Text>
          </Text>

          <Text style={styles.footerCenter}>
            <Text
              onPress={() => {
                onClose();
                router.push('/forgot-password');
              }}
              style={styles.forgotLink}
            >
              {t.forgotPassword}
            </Text>
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  close: { alignSelf: 'flex-end', padding: 4 },
  title: { fontSize: 22, fontWeight: '800', color: '#111', textAlign: 'center', marginBottom: 8 },
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  gIcon: { width: 20, height: 20 },
  gText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
  line: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  or: { color: '#9ca3af', fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111',
  },
  error: { color: '#ef4444', fontSize: 13, textAlign: 'center' },
  btn: {
    backgroundColor: '#008b1d',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  footer: { textAlign: 'center', color: '#6b7280', fontSize: 14, marginTop: 8 },
  footerCenter: { textAlign: 'center', marginTop: 8 },
  link: { color: '#008b1d', fontWeight: '700' },
  forgotLink: { color: '#059669', fontWeight: '700' },
});