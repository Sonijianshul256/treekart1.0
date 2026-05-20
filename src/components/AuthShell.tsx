"use client";

import { useAuth } from '@/hooks/useAuth';
import { isAuthPath, isProtectedPath } from '@/lib/routes';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, Suspense, useEffect } from 'react';

function AuthShellInner({ children }: { children: ReactNode }) {
  const { isLoading, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isProtected = isProtectedPath(pathname);
  const isAuthPage = isAuthPath(pathname);

  useEffect(() => {
    if (isLoading) return;

    if (user && isAuthPage) {
      router.replace('/orchard');
      return;
    }

    if (!user && isProtected) {
      router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
      return;
    }
  }, [isLoading, user, pathname, router, isAuthPage, isProtected]);

  if (isLoading && (isProtected || isAuthPage)) {
    return <div className="grid min-h-[50vh] place-items-center bg-grove-50 text-grove-700">Loading Treekart…</div>;
  }

  if (!isLoading && isProtected && !user) {
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
