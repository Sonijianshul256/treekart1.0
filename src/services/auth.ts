import type { User } from 'firebase/auth';
import type { AppUser } from '@/types';
import { createReferralCode } from '@/utils/referrals';

export function buildDefaultProfile(
  user: User,
  overrides: Partial<Pick<AppUser, 'name' | 'email' | 'city' | 'photoURL' | 'onboardingComplete'>> & {
    referralCodeInput?: string;
  } = {}
): AppUser {
  const email = overrides.email ?? user.email ?? '';
  const name = overrides.name ?? user.displayName ?? '';
  const hasProfileBasics = Boolean(name.trim() && (overrides.city?.trim() || user.displayName));

  return {
    uid: user.uid,
    name,
    email,
    city: overrides.city,
    photoURL: overrides.photoURL ?? user.photoURL ?? undefined,
    referralCode: createReferralCode(email || user.uid, user.uid),
    carbonTotal: 0,
    onboardingComplete: overrides.onboardingComplete ?? hasProfileBasics,
    notificationSettings: {
      morningPhoto: true,
      soilAlert: true,
      growthUpdate: true,
      weeklyVideo: true,
      harvestAlert: true
    },
    ...(overrides.referralCodeInput ? { referralCodeInput: overrides.referralCodeInput } : {})
  };
}
