import admin from 'firebase-admin';
import Stripe from 'stripe';
import * as functions from 'firebase-functions/v1';
import { onCall, HttpsError, onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger, setGlobalOptions } from 'firebase-functions/v2';
import nodemailer from 'nodemailer';

admin.initializeApp();
setGlobalOptions({ region: 'asia-south1', maxInstances: 10 });

const db = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-02-24.acacia' });

const priceIds = {
  Papaya: process.env.STRIPE_PAPAYA_YEARLY_PRICE || '',
  Mango: process.env.STRIPE_MANGO_YEARLY_PRICE || '',
  sharedPapaya: process.env.STRIPE_PAPAYA_SHARED_PRICE || '',
  sharedMango: process.env.STRIPE_MANGO_SHARED_PRICE || '',
  employeeGift: process.env.STRIPE_EMPLOYEE_TREE_PRICE || '',
  donation: process.env.STRIPE_DONATION_100_PRICE || ''
};

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
});

async function sendEmail(to: string, subject: string, text: string) {
  if (!process.env.SMTP_HOST || !to) {
    logger.info('Email fallback skipped', { to, subject });
    return;
  }
  await mailer.sendMail({ from: process.env.EMAIL_FROM || 'Treekart <hello@treekart.in>', to, subject, text });
}

function createReferralCode(nameOrEmail: string, uid: string) {
  const base = nameOrEmail.split('@')[0].replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase();
  return `${base || 'TREE'}${uid.slice(0, 5).toUpperCase()}`;
}

const defaultNotificationSettings = {
  morningPhoto: true,
  soilAlert: true,
  growthUpdate: true,
  weeklyVideo: true,
  harvestAlert: true
};

export const onAuthUserCreate = functions.region('asia-south1').auth.user().onCreate(async (user) => {
  const ref = db.collection('users').doc(user.uid);
  const snap = await ref.get();
  if (snap.exists) return;

  await ref.set({
    uid: user.uid,
    name: user.displayName || '',
    email: user.email || '',
    photoURL: user.photoURL || null,
    referralCode: createReferralCode(user.email || user.uid, user.uid),
    carbonTotal: 0,
    onboardingComplete: false,
    notificationSettings: defaultNotificationSettings,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
});

async function sendOneSignal(userId: string, heading: string, content: string, url?: string) {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  if (!appId || !apiKey) return false;

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      app_id: appId,
      include_external_user_ids: [userId],
      headings: { en: heading },
      contents: { en: content },
      url
    })
  });
  return response.ok;
}

export const createCheckoutSession = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');
  const { treeId, plan, coOwnerEmail, companyCode, giftEmail, successUrl, cancelUrl } = request.data as {
    treeId?: string;
    plan: 'individual' | 'shared' | 'employee_gift' | 'donation' | 'gift';
    coOwnerEmail?: string;
    companyCode?: string;
    giftEmail?: string;
    successUrl: string;
    cancelUrl: string;
  };

  let price = priceIds.donation;
  let mode: Stripe.Checkout.SessionCreateParams.Mode = 'payment';
  const metadata: Record<string, string> = { userId: request.auth.uid, plan };

  if (plan !== 'donation') {
    if (!treeId) throw new HttpsError('invalid-argument', 'treeId is required.');
    const treeSnap = await db.collection('trees').doc(treeId).get();
    if (!treeSnap.exists) throw new HttpsError('not-found', 'Tree not found.');
    const tree = treeSnap.data()!;
    metadata.treeId = treeId;
    metadata.treeType = tree.type;
    metadata.coOwnerEmail = coOwnerEmail || '';
    metadata.companyCode = companyCode || '';
    metadata.giftEmail = giftEmail || '';

    if (plan === 'individual' || plan === 'gift') price = tree.type === 'Mango' ? priceIds.Mango : priceIds.Papaya;
    if (plan === 'shared') price = tree.type === 'Mango' ? priceIds.sharedMango : priceIds.sharedPapaya;
    if (plan === 'employee_gift') {
      if (!companyCode) throw new HttpsError('invalid-argument', 'Company code is required.');
      price = priceIds.employeeGift;
    }
    mode = plan === 'employee_gift' || plan === 'gift' ? 'payment' : 'subscription';
  }

  if (!price) throw new HttpsError('failed-precondition', 'Stripe price id is not configured.');

  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: [{ price, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: request.auth.uid,
    customer_email: request.auth.token.email,
    metadata,
    subscription_data: mode === 'subscription' ? { metadata } : undefined
  });

  return { url: session.url };
});

export const stripeWebhook = onRequest(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, signature as string, webhookSecret);
  } catch (error) {
    res.status(400).send(`Webhook Error: ${(error as Error).message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};
    const userId = metadata.userId;
    const treeId = metadata.treeId;
    const plan = metadata.plan;
    const now = admin.firestore.Timestamp.now();
    const endDate = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));

    if (plan === 'donation') {
      await db.collection('donations').add({
        userId,
        amount: 100,
        date: now,
        partnerForestLocation: new admin.firestore.GeoPoint(26.2389, 73.0243),
        stripeSessionId: session.id
      });
    } else if (treeId && userId) {
      const treeRef = db.collection('trees').doc(treeId);
      const amount = Number(session.amount_total || 0) / 100;

      await db.runTransaction(async (tx) => {
        const treeSnap = await tx.get(treeRef);
        if (!treeSnap.exists) return;
        const tree = treeSnap.data()!;
        const sharedWith = new Set<string>(tree.sharedWith || []);

        if (plan === 'shared' && metadata.coOwnerEmail) {
          await db.collection('pendingInvitations').add({
            treeId,
            inviterId: userId,
            coOwnerEmail: metadata.coOwnerEmail,
            status: 'awaiting_payment',
            createdAt: now,
            stripeSessionId: session.id
          });
          await sendEmail(metadata.coOwnerEmail, 'You were invited to share a Treekart tree', `Open Treekart and pay your half for tree ${treeId}.`);
        }

        if (plan === 'gift' && metadata.giftEmail) {
          await db.collection('giftTokens').add({
            treeId,
            purchaserId: userId,
            giftEmail: metadata.giftEmail,
            token: session.id,
            status: 'pending_claim',
            createdAt: now
          });
          await sendEmail(metadata.giftEmail, 'A Treekart tree was gifted to you', `Sign in to Treekart and claim gift token ${session.id}.`);
        }

        tx.update(treeRef, {
          status: 'rented',
          ownerId: plan === 'gift' ? tree.ownerId || userId : userId,
          sharedWith: Array.from(sharedWith)
        });
      });

      await db.collection('subscriptions').add({
        userId,
        treeId,
        startDate: now,
        endDate,
        renewalDate: endDate,
        amount,
        isShared: plan === 'shared',
        autoRenew: session.mode === 'subscription',
        stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : null,
        stripeSessionId: session.id
      });

      await db.collection('carbonLogs').add({
        userId,
        treeId,
        co2Kg: metadata.treeType === 'Mango' ? 70 : 40,
        date: now
      });
    }
  }

  res.json({ received: true });
});

export const cancelSubscription = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');
  const { subscriptionId } = request.data as { subscriptionId: string };
  const subRef = db.collection('subscriptions').doc(subscriptionId);
  const snap = await subRef.get();
  if (!snap.exists || snap.data()?.userId !== request.auth.uid) throw new HttpsError('permission-denied', 'No access.');
  const stripeSubscriptionId = snap.data()?.stripeSubscriptionId;
  if (stripeSubscriptionId) await stripe.subscriptions.cancel(stripeSubscriptionId);
  await subRef.update({ autoRenew: false, cancelledAt: admin.firestore.FieldValue.serverTimestamp() });
  return { ok: true };
});

export const confirmHarvestAddress = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');
  const { treeId, address } = request.data as { treeId: string; address: string };
  await db.collection('harvestAddresses').add({ treeId, userId: request.auth.uid, address, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return { ok: true };
});

export const completeUserProfile = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');

  const { name, city, referralCode } = request.data as { name: string; city: string; referralCode?: string };
  if (!name?.trim() || !city?.trim()) throw new HttpsError('invalid-argument', 'Name and city are required.');

  const uid = request.auth.uid;
  const update: Record<string, unknown> = {
    name: name.trim(),
    city: city.trim(),
    onboardingComplete: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  if (referralCode?.trim()) {
    const code = referralCode.trim().toUpperCase();
    const referrerSnap = await db.collection('users').where('referralCode', '==', code).limit(1).get();
    if (!referrerSnap.empty && referrerSnap.docs[0].id !== uid) {
      update.referralCodeInput = code;
    }
  }

  await db.collection('users').doc(uid).set(update, { merge: true });
  return { ok: true };
});

export const deleteUserAccount = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');

  const uid = request.auth.uid;
  const batch = db.batch();

  const posts = await db.collection('posts').where('userId', '==', uid).limit(200).get();
  posts.docs.forEach((docSnap) => batch.delete(docSnap.ref));

  batch.delete(db.collection('users').doc(uid));
  await batch.commit();
  await admin.auth().deleteUser(uid);

  return { ok: true };
});

export const adminMarkDelivery = onCall(async (request) => {
  if (!request.auth?.token.admin) throw new HttpsError('permission-denied', 'Admin claim required.');
  const { deliveryId, status, ripeness, eta, driverContact } = request.data as {
    deliveryId: string;
    status: string;
    ripeness?: string;
    eta?: string;
    driverContact?: string;
  };
  await db.collection('deliveries').doc(deliveryId).set(
    {
      status,
      ripeness,
      eta,
      driverContact,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );
  return { ok: true };
});

export const onDeliveryReady = onDocumentUpdated('deliveries/{deliveryId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (before?.status === after?.status || after?.status !== 'packed') return;
  const userSnap = await db.collection('users').doc(after.userId).get();
  const email = userSnap.data()?.email;
  await sendEmail(email, 'Your Treekart harvest is packed', `Track your harvest delivery in Treekart. ETA: ${after.eta || 'soon'}.`);
});

export const onReferralCreated = onDocumentCreated('subscriptions/{subscriptionId}', async (event) => {
  const sub = event.data?.data();
  if (!sub?.userId) return;
  const userSnap = await db.collection('users').doc(sub.userId).get();
  const referralCode = userSnap.data()?.referralCodeUsed || userSnap.data()?.referralCodeInput;
  if (!referralCode) return;
  const referrerSnap = await db.collection('users').where('referralCode', '==', referralCode).limit(1).get();
  if (referrerSnap.empty) return;

  const referrerId = referrerSnap.docs[0].id;
  const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
  const extend = async (uid: string) => {
    const ref = db.collection('users').doc(uid);
    const snap = await ref.get();
    const current = snap.data()?.subscriptionEndDate?.toDate?.() || new Date();
    const base = current > new Date() ? current : new Date();
    await ref.update({ subscriptionEndDate: admin.firestore.Timestamp.fromDate(new Date(base.getTime() + oneMonthMs)) });
  };

  await Promise.all([extend(referrerId), extend(sub.userId)]);
  await db.collection('referrals').add({
    referrerId,
    referredId: sub.userId,
    date: admin.firestore.FieldValue.serverTimestamp(),
    rewardStatus: 'granted'
  });
});

async function notifyOwners(kind: string, heading: string, content: (tree: FirebaseFirestore.DocumentData, update?: FirebaseFirestore.DocumentData) => string) {
  const trees = await db.collection('trees').where('status', '==', 'rented').get();
  for (const treeDoc of trees.docs) {
    const tree = treeDoc.data();
    const ownerIds = [tree.ownerId, ...(tree.sharedWith || [])].filter(Boolean);
    const updates = await db.collection('dailyUpdates').where('treeId', '==', treeDoc.id).orderBy('timestamp', 'desc').limit(1).get();
    const update = updates.docs[0]?.data();
    for (const userId of ownerIds) {
      const user = await db.collection('users').doc(userId).get();
      const settings = user.data()?.notificationSettings || {};
      if (settings[kind] === false) continue;
      const sent = await sendOneSignal(userId, heading, content(tree, update), update?.photoUrl);
      if (!sent) await sendEmail(user.data()?.email, heading, content(tree, update));
    }
  }
}

export const morningPhotoNotification = onSchedule('every day 07:00', () =>
  notifyOwners('morningPhoto', 'Today’s tree photo', (_tree, update) => update?.photoUrl || 'A fresh daily update is ready.')
);

export const noonSoilNotification = onSchedule('every day 12:00', () =>
  notifyOwners('soilAlert', 'Soil moisture check', (tree) => `${tree.userGivenName || tree.type} soil moisture needs your attention.`)
);

export const eveningGrowthNotification = onSchedule('every day 18:00', () =>
  notifyOwners('growthUpdate', 'Growth update', (tree) => `${tree.type} is moving through its organic growth cycle.`)
);

export const weeklyVideoNotification = onSchedule('every sunday 09:00', () =>
  notifyOwners('weeklyVideo', 'Weekly farm video', () => 'Your weekly YouTube farm walk is ready.')
);

export const harvestAlertNotification = onSchedule('every day 08:00', async () =>
  notifyOwners('harvestAlert', 'Harvest address confirmation', (tree) => `${tree.type} harvest is close. Confirm your delivery address.`)
);
