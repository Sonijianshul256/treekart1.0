"use client";

import { ReactNode } from 'react';

/** Route protection is handled by AuthShell in providers. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
