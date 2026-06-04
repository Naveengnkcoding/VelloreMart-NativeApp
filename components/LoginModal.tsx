import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

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

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity onPress={onClose} style={styles.close}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>

          <Text style={styles.title}>{t.login}</Text>

          <TouchableOpacity onPress={signInWithGoogle} style={styles.google}>
            <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }} style={styles.gIcon} />
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