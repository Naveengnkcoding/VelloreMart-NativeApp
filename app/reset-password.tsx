import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';

function parseUrlParams(url: string) {
  try {
    const parsed = new URL(url);
    const params = new URLSearchParams(parsed.search);
    if (parsed.hash?.startsWith('#')) {
      const hashParams = new URLSearchParams(parsed.hash.slice(1));
      hashParams.forEach((value, key) => params.set(key, value));
    }
    return Object.fromEntries(params.entries());
  } catch {
    return {};
  }
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useLanguage();
  const { recoverSession } = useAuth();
  const [status, setStatus] = useState<'loading' | 'ready' | 'invalid' | 'success'>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = typeof params.access_token === 'string' ? params.access_token : undefined;
      const refreshToken = typeof params.refresh_token === 'string' ? params.refresh_token : undefined;
      let token = accessToken;
      let refresh = refreshToken;

      if (!token) {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          const parsed = parseUrlParams(initialUrl);
          token = typeof parsed.access_token === 'string' ? parsed.access_token : token;
          refresh = typeof parsed.refresh_token === 'string' ? parsed.refresh_token : refresh;
        }
      }

      if (!token) {
        setErrorMessage('Unable to parse reset token from the link. Please open the password reset email again.');
        setStatus('invalid');
        return;
      }

      try {
        await recoverSession(token, refresh);
        setStatus('ready');
      } catch (error: any) {
        setErrorMessage(error?.message || 'Unable to restore reset session.');
        setStatus('invalid');
      }
    };

    restoreSession();
  }, [params.access_token, params.refresh_token, recoverSession]);

  const handleSubmit = async () => {
    if (!password || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setStatus('success');
    Alert.alert('Success', 'Your password has been updated. Please log in with your new password.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t.resetPassword}</Text>

        {status === 'loading' && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>Preparing reset form...</Text>
          </View>
        )}

        {status === 'invalid' && (
          <>
            <Text style={styles.subtitle}>{errorMessage}</Text>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/forgot-password')}>
              <Text style={styles.buttonText}>{t.forgotPassword}</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'ready' && (
          <>
            <Text style={styles.subtitle}>Enter your new password below.</Text>
            <TextInput
              style={styles.input}
              placeholder={t.newPassword}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              style={styles.input}
              placeholder={t.confirmNewPassword}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t.updatePassword}</Text>}
            </TouchableOpacity>
          </>
        )}

        {status === 'success' && (
          <>
            <Text style={styles.subtitle}>Password updated successfully.</Text>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/')}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 15,
    marginBottom: 20,
    lineHeight: 22,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#475569',
    marginLeft: 12,
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
