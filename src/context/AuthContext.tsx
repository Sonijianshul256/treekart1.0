"use client";

import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef
} from 'react';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import { initOneSignal } from '@/lib/onesignal';
import { buildDefaultProfile } from '@/services/auth';
import { completeUserProfile, deleteUserAccount } from '@/services/functions';
import { getUser, upsertUser } from '@/services/firestore';
import type { AppUser } from '@/types';
import { mapAuthError } from '@/utils/authErrors';

type AuthState = {
  firebaseUser: User | null;
  profile: AppUser | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (input: { name: string; email: string; password: string; city?: string; referralCode?: string }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (data: { name: string; city: string; referralCode?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function reducer(state: AuthState, patch: Partial<AuthState>) {
  return { ...state, ...patch };
}

function assertFirebaseAuth() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase Authentication is not configured. Add Firebase web app keys to .env and restart the dev server.');
  }
  return auth;
}

async function ensureUserProfile(user: User): Promise<AppUser> {
  let profile = await getUser(user.uid);
  if (!profile) {
    profile = buildDefaultProfile(user);
    await upsertUser(profile);
  }
  return profile;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useReducer(reducer, { firebaseUser: null, profile: null, loading: true });
  const oneSignalUid = useRef<string | null>(null);

  const syncUser = useCallback(async (user: User | null) => {
    if (!user) {
      oneSignalUid.current = null;
      setState({ firebaseUser: null, profile: null, loading: false });
      return;
    }

    try {
      const profile = await ensureUserProfile(user);
      setState({ firebaseUser: user, profile, loading: false });

      if (oneSignalUid.current !== user.uid) {
        oneSignalUid.current = user.uid;
        void initOneSignal(user.uid);
      }
    } catch (error) {
      console.error('Error during auth state change:', error);
      setState({
        firebaseUser: user,
        profile: buildDefaultProfile(user),
        loading: false
      });
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setState({ firebaseUser: null, profile: null, loading: false });
      return;
    }

    return onAuthStateChanged(auth, (user) => {
      void syncUser(user);
    });
  }, [syncUser]);

  const refreshProfile = useCallback(async () => {
    if (!state.firebaseUser) return;
    const profile = await getUser(state.firebaseUser.uid);
    if (profile) setState({ profile });
  }, [state.firebaseUser]);

  const loginWithGoogle = useCallback(async () => {
    await signInWithPopup(assertFirebaseAuth(), googleProvider);
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(assertFirebaseAuth(), email.trim(), password);
  }, []);

  const signupWithEmail = useCallback(
    async ({
      name,
      email,
      password,
      city,
      referralCode
    }: {
      name: string;
      email: string;
      password: string;
      city?: string;
      referralCode?: string;
    }) => {
      const firebaseAuth = assertFirebaseAuth();
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });

      const nextProfile = buildDefaultProfile(credential.user, {
        name: name.trim(),
        email: email.trim(),
        city: city?.trim(),
        onboardingComplete: Boolean(name.trim() && city?.trim()),
        referralCodeInput: referralCode?.trim() || undefined
      });

      await upsertUser(nextProfile);

      try {
        await sendEmailVerification(credential.user);
      } catch (error) {
        console.warn('Could not send verification email:', error);
      }
    },
    []
  );

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(assertFirebaseAuth(), email.trim());
  }, []);

  const logout = useCallback(async () => {
    if (!isFirebaseConfigured || !auth) {
      setState({ firebaseUser: null, profile: null, loading: false });
      return;
    }
    await signOut(auth);
  }, []);

  const completeOnboarding = useCallback(
    async (data: { name: string; city: string; referralCode?: string }) => {
      if (!state.firebaseUser || !state.profile) return;

      const nextProfile: AppUser = {
        ...state.profile,
        name: data.name.trim(),
        city: data.city.trim(),
        onboardingComplete: true,
        ...(data.referralCode?.trim() ? { referralCodeInput: data.referralCode.trim() } : {})
      };

      if (isFirebaseConfigured) {
        try {
          await completeUserProfile({
            name: nextProfile.name,
            city: nextProfile.city!,
            referralCode: data.referralCode?.trim()
          });
        } catch (error) {
          console.warn('completeUserProfile callable failed, falling back to client write:', error);
          await upsertUser(nextProfile);
        }
      }

      setState({ profile: nextProfile });
    },
    [state.firebaseUser, state.profile]
  );

  const deleteAccountHandler = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setState({ firebaseUser: null, profile: null, loading: false });
      return;
    }
    await deleteUserAccount();
    setState({ firebaseUser: null, profile: null, loading: false });
    try {
      if (auth) await signOut(auth);
    } catch {
      /* auth user may already be deleted server-side */
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.firebaseUser),
      loginWithGoogle,
      loginWithEmail,
      signupWithEmail,
      resetPassword,
      logout,
      completeOnboarding,
      refreshProfile,
      deleteAccount: deleteAccountHandler
    }),
    [state, loginWithGoogle, loginWithEmail, signupWithEmail, resetPassword, logout, completeOnboarding, refreshProfile, deleteAccountHandler]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

export { mapAuthError };
