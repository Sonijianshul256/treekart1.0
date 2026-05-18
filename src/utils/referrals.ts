export function createReferralCode(nameOrEmail: string, uid: string) {
  const base = nameOrEmail.split('@')[0].replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase();
  return `${base || 'TREE'}${uid.slice(0, 5).toUpperCase()}`;
}
