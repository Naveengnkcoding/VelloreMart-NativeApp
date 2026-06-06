import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Configure Google Sign-In once on mount
   useEffect(() => {
    if (process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        offlineAccess: false,      // true only if you need refresh tokens
        forceCodeForRefreshToken: false,
      });
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !profile && !loading) {
      const meta = user.user_metadata || {};
      supabase
        .from('customers')
        .upsert({
          id: user.id,
          email: user.email,
          name: meta.full_name || meta.name || '',
          phone: meta.phone || '',
          address: '',
        })
        .then(() => fetchProfile(user.id));
    }
  }, [user, profile, loading]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data);
  };

  const upsertCustomer = async (payload: any) => {
    return supabase.from('customers').upsert(payload);
  };

  const activateCustomer = async (userId: string) => {
    return supabase
      .from('customers')
      .update({ deleted: null })
      .eq('id', userId);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, extra: any) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      await supabase.from('customers').insert({
        id: data.user.id,
        email,
        name: extra.name,
        phone: extra.phone,
        alternate_phone: extra.alternatePhone || null,
        address: extra.address,
      });
    }
  };

    // ─── NATIVE GOOGLE SIGN-IN (Android) ───
  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // v13+ API: returns { type: 'success', data: User } | { type: 'cancelled' }
      const response = await GoogleSignin.signIn();

      if (response.type !== 'success') {
        throw new Error('Google Sign-In was cancelled');
      }

      const idToken = response.data.idToken;
      if (!idToken) {
        throw new Error('Google Sign-In failed: No ID token received.');
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw error;

      // Immediately create customer row so UI updates instantly
      if (data.user) {
        const meta = data.user.user_metadata || {};
        // await upsertCustomer({
        //   id: data.user.id,
        //   email: data.user.email,
        //   name: meta.full_name || meta.name || '',
        //   phone: meta.phone || '',
        //   address: '',
        // });
        await fetchProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Native Google Sign-In Error:', error.message || error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://velloresanthai.shop/reset-password',
    });
    if (error) throw error;
  };

  const recoverSession = async (accessToken: string, refreshToken?: string) => {
    const payload = {
      access_token: accessToken,
      refresh_token: refreshToken ?? '',
    };
    const { error } = await supabase.auth.setSession(payload);
    if (error) throw error;
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut(); // Clear native Google account so next user can pick a different one
    } catch {
      // Ignore if user wasn't signed in with Google
    }
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        recoverSession,
        fetchProfile,
        upsertCustomer,
        activateCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);