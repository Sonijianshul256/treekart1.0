import { httpsCallable } from 'firebase/functions';
import { functions, isFirebaseConfigured } from '@/lib/firebase';
import type { SubscriptionPlan } from '@/types';

export async function createCheckoutSession(input: {
  treeId?: string;
  plan: SubscriptionPlan;
  coOwnerEmail?: string;
  companyCode?: string;
  giftEmail?: string;
}) {
  if (!isFirebaseConfigured || !functions) {
    return { url: `${window.location.origin}/orchard?checkout=demo-success` };
  }
  const callable = httpsCallable(functions, 'createCheckoutSession');
  const result = await callable({
    ...input,
    successUrl: `${window.location.origin}/orchard?checkout=success`,
    cancelUrl: `${window.location.origin}/map?checkout=cancelled`
  });
  return result.data as { url: string };
}

export async function cancelSubscription(subscriptionId: string) {
  if (!isFirebaseConfigured || !functions) return { data: { ok: true, subscriptionId } };
  const callable = httpsCallable(functions, 'cancelSubscription');
  return callable({ subscriptionId });
}

export async function confirmAddressForHarvest(treeId: string, address: string) {
  if (!isFirebaseConfigured || !functions) return { data: { ok: true, treeId, address } };
  const callable = httpsCallable(functions, 'confirmHarvestAddress');
  return callable({ treeId, address });
}

export async function adminMarkDelivery(input: { deliveryId: string; status: string; ripeness?: string; eta?: string; driverContact?: string }) {
  if (!isFirebaseConfigured || !functions) return { data: { ok: true, ...input } };
  const callable = httpsCallable(functions, 'adminMarkDelivery');
  return callable(input);
}

export async function completeUserProfile(input: { name: string; city: string; referralCode?: string }) {
  if (!isFirebaseConfigured || !functions) return { ok: true };
  const callable = httpsCallable<typeof input, { ok: boolean }>(functions, 'completeUserProfile');
  const result = await callable(input);
  return result.data;
}

export async function deleteUserAccount() {
  if (!isFirebaseConfigured || !functions) return { ok: true };
  const callable = httpsCallable(functions, 'deleteUserAccount');
  const result = await callable({});
  return result.data as { ok: boolean };
}
