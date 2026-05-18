const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Contact support.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Try again or reset your password.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/email-already-in-use': 'An account with this email already exists. Sign in instead.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/popup-blocked': 'Allow popups for this site to sign in with Google.',
  'auth/account-exists-with-different-credential': 'This email is linked to another sign-in method.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase Console.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/requires-recent-login': 'Sign out and sign in again before changing sensitive settings.',
  'auth/missing-email': 'Enter your email address.'
};

export function mapAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
}
