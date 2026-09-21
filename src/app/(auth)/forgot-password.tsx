import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { AppText, Button, Screen, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    const e = email.trim();
    if (!EMAIL_RE.test(e)) return setError('Enter a valid email address.');

    setLoading(true);
    // On web, send the reset link back to this app's /reset-password page.
    // On native the project's Site URL is used (opens the web reset page).
    const redirectTo =
      Platform.OS === 'web'
        ? `${(globalThis as any).location?.origin ?? ''}/reset-password`
        : undefined;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(e, { redirectTo });
    setLoading(false);
    if (resetError) return setError(resetError.message);
    setSent(true);
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'center', padding: Spacing.four, gap: Spacing.four }}
      >
        <View style={{ gap: Spacing.two }}>
          <AppText variant="title">Reset password</AppText>
          <AppText variant="caption">Enter your email and we&apos;ll send a reset link.</AppText>
        </View>

        {sent ? (
          <View style={{ gap: Spacing.three }}>
            <AppText variant="body">
              If an account exists for {email.trim()}, a reset link is on its way. Check your inbox
              (and spam).
            </AppText>
            <Button title="Back to sign in" onPress={() => router.replace('/sign-in')} />
          </View>
        ) : (
          <View style={{ gap: Spacing.three }}>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              autoFocus
              onSubmitEditing={onSubmit}
            />
            {error ? (
              <AppText variant="caption" color="danger">
                {error}
              </AppText>
            ) : null}
            <Button title="Send reset link" onPress={onSubmit} loading={loading} />
            <Button
              title="Back to sign in"
              variant="ghost"
              onPress={() => router.replace('/sign-in')}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}
