/** Routes that do not require sign-in. */
export const PUBLIC_PATHS = ['/', '/map', '/how-we-grow', '/signin', '/signup', '/forgot-password'] as const;

export const AUTH_PATHS = ['/signin', '/signup', '/forgot-password'] as const;

/** Routes that require a signed-in user with completed onboarding. */
export const PROTECTED_PATHS = ['/orchard', '/profile', '/community', '/carbon', '/delivery', '/admin'] as const;

export function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname as (typeof PUBLIC_PATHS)[number])) return true;
  if (pathname.startsWith('/tree/')) return true;
  return false;
}

export function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function isAuthPath(pathname: string) {
  return AUTH_PATHS.includes(pathname as (typeof AUTH_PATHS)[number]);
}
