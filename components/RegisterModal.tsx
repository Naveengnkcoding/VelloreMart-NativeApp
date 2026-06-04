import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function RegisterModal({ visible, onClose, onSwitchLogin }: any) {
  const { t } = useLanguage();
  const { signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signUp(email, password, { name, phone, alternatePhone: altPhone, address });
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

          <Text style={styles.title}>{t.register}</Text>
          <Text style={styles.hint}>{t.cartHasItems}</Text>

          <TouchableOpacity onPress={signInWithGoogle} style={styles.google}>
            <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }} style={styles.gIcon} />
            <Text style={styles.gText}>{t.signUpGoogle}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.or}>{t.or}</Text>
            <View style={styles.line} />
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <TextInput style={styles.input} placeholder={t.email} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <TextInput style={styles.input} placeholder={t.password} value={password} onChangeText={setPassword} secureTextEntry />
            <TextInput style={styles.input} placeholder={t.confirmPassword} value={confirm} onChangeText={setConfirm} secureTextEntry />
            <TextInput style={styles.input} placeholder={t.name} value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder={t.phone} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder={t.alternatePhone} value={altPhone} onChangeText={setAltPhone} keyboardType="phone-pad" />
            <TextInput style={[styles.input, { height: 80 }]} placeholder={t.address} value={address} onChangeText={setAddress} multiline />
          </ScrollView>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity onPress={handleRegister} style={styles.btn}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t.register}</Text>}
          </TouchableOpacity>

          <Text style={styles.footer}>
            {t.alreadyAccount} <Text onPress={onSwitchLogin} style={styles.link}>{t.loginNow}</Text>
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
    maxHeight: '90%',
  },
  close: { alignSelf: 'flex-end', padding: 4 },
  title: { fontSize: 22, fontWeight: '800', color: '#111', textAlign: 'center', marginBottom: 4 },
  hint: { color: '#059669', fontSize: 13, textAlign: 'center', marginBottom: 12 },
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
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 12 },
  line: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  or: { color: '#9ca3af', fontSize: 13 },
  form: { maxHeight: 320, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111',
    marginBottom: 10,
  },
  error: { color: '#ef4444', fontSize: 13, textAlign: 'center', marginBottom: 8 },
  btn: {
    backgroundColor: '#86efac',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  footer: { textAlign: 'center', color: '#6b7280', fontSize: 14, marginTop: 12 },
  link: { color: '#059669', fontWeight: '700' },
});