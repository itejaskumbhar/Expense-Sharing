import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { AppText, Button, Screen, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // A valid recovery session (from the email link) is required to set a new
  // password. On web, supabase-js parses the token from the URL automatically.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit() {
    setError(null);
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) return setError(updateError.message);
    // Now signed in with the new password.
    router.replace('/');
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'center', padding: Spacing.four, gap: Spacing.four }}
      >
        <View style={{ gap: Spacing.two }}>
          <AppText variant="title">Set a new password</AppText>
          {!ready ? (
            <AppText variant="caption" color="warning">
              Open this page from the reset link in your email. If you just did, give it a second…
            </AppText>
          ) : (
            <AppText variant="caption">Choose a new password for your account.</AppText>
          )}
        </View>

        <View style={{ gap: Spacing.three }}>
          <TextField
            label="New password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />
          <TextField
            label="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            placeholder="Re-enter password"
            onSubmitEditing={onSubmit}
          />
          {error ? (
            <AppText variant="caption" color="danger">
              {error}
            </AppText>
          ) : null}
          <Button title="Update password" onPress={onSubmit} loading={loading} disabled={!ready} />
          <Button
            title="Back to sign in"
            variant="ghost"
            onPress={() => router.replace('/sign-in')}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
