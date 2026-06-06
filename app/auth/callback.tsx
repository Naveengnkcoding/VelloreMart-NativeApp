import { useURL } from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const url = useURL();

  useEffect(() => {
    if (!url) return;

    const handleUrl = async (urlString: string) => {
      console.log('Auth callback URL:', urlString);
      const parsed = new URL(urlString);

      // -------- OAuth (Google / Email providers) --------
      const code = parsed.searchParams.get('code');
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('OAuth exchange failed:', error.message);
        } else {
          console.log('OAuth success:', data.session?.user?.email);
          await WebBrowser.dismissBrowser(); // Close browser modal
          router.replace('/(tabs)');
          return;
        }
      }

      // -------- Magic Link / Email Confirmation --------
      const token_hash = parsed.searchParams.get('token_hash');
      const type = parsed.searchParams.get('type') as any; // signup, recovery, magiclink, etc.
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type });
        if (error) {
          console.error('Magic link verify failed:', error.message);
        } else {
          console.log('Magic link verified');
          await WebBrowser.dismissBrowser();
          router.replace('/(tabs)');
          return;
        }
      }

      // Fallback: if nothing matched, go home anyway
      await WebBrowser.dismissBrowser();
      router.replace('/(tabs)');
    };

    handleUrl(url);
  }, [url]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6', gap: 12 }}>
      <ActivityIndicator color="#059669" size="large" />
      <Text style={{ color: '#666', fontSize: 14 }}>Completing sign in...</Text>
    </View>
  );
}