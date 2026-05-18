"use client";

import { ReactNode } from 'react';

/** Auth redirects are handled by AuthShell; this wrapper remains for page composition. */
export function AuthRoute({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
