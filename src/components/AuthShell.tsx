"use client";

import { useAuth } from '@/context/AuthContext';
import { isAuthPath, isProtectedPath } from '@/lib/routes';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, Suspense, useEffect } from 'react';

function AuthShellInner({ children }: { children: ReactNode }) {
  const { loading, firebaseUser, profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isProtected = isProtectedPath(pathname);
  const isAuthPage = isAuthPath(pathname);
  const isOnboarding = pathname === '/onboarding';
  const onboardingDone = Boolean(profile?.onboardingComplete);

  useEffect(() => {
    if (loading) return;

    if (firebaseUser && onboardingDone && (isAuthPage || isOnboarding)) {
      router.replace('/orchard');
      return;
    }

    if (firebaseUser && profile && !onboardingDone && !isOnboarding && isProtected) {
      router.replace('/onboarding');
      return;
    }

    if (!firebaseUser && isProtected) {
      router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!firebaseUser && isOnboarding) {
      router.replace('/signin');
    }
  }, [loading, firebaseUser, profile, onboardingDone, pathname, router, isAuthPage, isOnboarding, isProtected]);

  if (loading && (isProtected || isOnboarding || isAuthPage)) {
    return <div className="grid min-h-[50vh] place-items-center bg-grove-50 text-grove-700">Loading Treekart…</div>;
  }

  if (!loading && isProtected && (!firebaseUser || !onboardingDone)) {
    return <div className="grid min-h-[50vh] place-items-center bg-grove-50 text-grove-700">Redirecting…</div>;
  }

  return <>{children}</>;
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="grid min-h-[50vh] place-items-center text-grove-700">Loading…</div>}>
      <AuthShellInner>{children}</AuthShellInner>
    </Suspense>
  );
}
