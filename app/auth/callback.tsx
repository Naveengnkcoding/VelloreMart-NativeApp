import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, []);

  return (
    <View>
      <Text>Signing you in…</Text>
    </View>
  );
}