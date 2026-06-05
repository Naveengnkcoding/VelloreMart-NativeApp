import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

// Required on Android — tells the in-app browser to hand control back to the app
WebBrowser.maybeCompleteAuthSession();

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // On some Android devices openAuthSessionAsync doesn't close automatically.
    // As a fallback, this screen also handles the redirect URL directly when
    // the OS deep-links into the app.
    //
    // expo-router will mount this component with the full URL (including ?code=)
    // available via expo-linking. We use supabase's built-in deep link handler
    // which reads window.location / the current URL on native via the registered
    // listener in AuthContext. So here we just wait a tick and navigate home.
    //
    // If you want belt-and-suspenders code exchange here too, uncomment below:
    //
    // import * as Linking from 'expo-linking';
    // const url = await Linking.getInitialURL();
    // if (url) {
    //   const { searchParams } = new URL(url);
    //   const code = searchParams.get('code');
    //   if (code) await supabase.auth.exchangeCodeForSession(code);
    // }

    const timer = setTimeout(() => {
      router.replace('/');
    }, 500); // small delay so session state settles

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#008b1d" />
      <Text style={styles.text}>Signing you in…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { marginTop: 16, fontSize: 16, color: '#374151' },
});