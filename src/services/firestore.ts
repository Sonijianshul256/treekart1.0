import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, isFirebaseConfigured, storage } from '@/lib/firebase';
import { demoDeliveries, demoPosts, demoSubscriptions, demoTrees, demoUpdates, demoUser, demoVoiceNotes } from '@/lib/demoData';
import type { AppUser, DailyUpdate, Delivery, Post, Subscription, Tree, VoiceNote } from '@/types';

const withId = <T>(snap: { id: string; data: () => object }) => ({ id: snap.id, ...snap.data() }) as T;

function cleanUndefined(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined);
  }
  if (Object.prototype.toString.call(obj) === '[object Object]') {
    const clean: any = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] !== undefined) {
        clean[key] = cleanUndefined(obj[key]);
      }
    }
    return clean;
  }
  return obj;
}

const getErrorMessage = (error: any) => error instanceof Error ? error.message : String(error);

export async function getUser(uid: string) {
  if (!isFirebaseConfigured || !db) return uid === demoUser.uid ? demoUser : null;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? ({ uid: snap.id, ...snap.data() } as AppUser) : null;
  } catch (error) {
    console.warn("Firestore getUser failed, falling back to demo data:", getErrorMessage(error));
    return uid === demoUser.uid ? demoUser : null;
  }
}

export async function upsertUser(user: AppUser) {
  if (!isFirebaseConfigured || !db) return;
  try {
    const cleanedUser = cleanUndefined(user);
    await setDoc(doc(db, 'users', user.uid), cleanedUser, { merge: true });
  } catch (error) {
    console.error("Firestore upsertUser failed:", getErrorMessage(error));
  }
}

export async function fetchTrees() {
  if (!isFirebaseConfigured || !db) return demoTrees;
  try {
    const snap = await getDocs(collection(db, 'trees'));
    return snap.docs.map((docSnap) => withId<Tree>(docSnap));
  } catch (error) {
    console.warn("Firestore fetchTrees failed, falling back to demo data:", getErrorMessage(error));
    return demoTrees;
  }
}

export async function fetchTree(treeId: string) {
  if (!isFirebaseConfigured || !db) return demoTrees.find((tree) => tree.id === treeId) || null;
  try {
    const snap = await getDoc(doc(db, 'trees', treeId));
    return snap.exists() ? withId<Tree>(snap) : null;
  } catch (error) {
    console.warn(`Firestore fetchTree(${treeId}) failed, falling back to demo data:`, getErrorMessage(error));
    return demoTrees.find((tree) => tree.id === treeId) || null;
  }
}

export async function fetchUserTrees(uid: string) {
  if (!isFirebaseConfigured || !db) return demoTrees.filter((tree) => tree.ownerId === uid || tree.sharedWith.includes(uid));
  try {
    const owned = await getDocs(query(collection(db, 'trees'), where('ownerId', '==', uid)));
    const shared = await getDocs(query(collection(db, 'trees'), where('sharedWith', 'array-contains', uid)));
    const merged = new Map<string, Tree>();
    [...owned.docs, ...shared.docs].forEach((docSnap) => merged.set(docSnap.id, withId<Tree>(docSnap)));
    return [...merged.values()];
  } catch (error) {
    console.warn("Firestore fetchUserTrees failed, falling back to demo data:", getErrorMessage(error));
    return demoTrees.filter((tree) => tree.ownerId === uid || tree.sharedWith.includes(uid));
  }
}

export async function fetchLatestUpdate(treeId: string) {
  if (!isFirebaseConfigured || !db) return demoUpdates.find((update) => update.treeId === treeId) || null;
  try {
    const snap = await getDocs(query(collection(db, 'dailyUpdates'), where('treeId', '==', treeId), orderBy('timestamp', 'desc'), limit(1)));
    return snap.empty ? null : withId<DailyUpdate>(snap.docs[0]);
  } catch (error) {
    console.warn("Firestore fetchLatestUpdate failed, falling back to demo data:", getErrorMessage(error));
    return demoUpdates.find((update) => update.treeId === treeId) || null;
  }
}

export async function fetchTreeUpdates(treeId: string) {
  if (!isFirebaseConfigured || !db) return demoUpdates.filter((update) => update.treeId === treeId);
  try {
    const snap = await getDocs(query(collection(db, 'dailyUpdates'), where('treeId', '==', treeId), orderBy('timestamp', 'desc'), limit(30)));
    return snap.docs.map((docSnap) => withId<DailyUpdate>(docSnap));
  } catch (error) {
    console.warn("Firestore fetchTreeUpdates failed, falling back to demo data:", getErrorMessage(error));
    return demoUpdates.filter((update) => update.treeId === treeId);
  }
}

export async function renameTree(treeId: string, userGivenName: string) {
  if (!isFirebaseConfigured || !db) {
    const tree = demoTrees.find((item) => item.id === treeId);
    if (tree) tree.userGivenName = userGivenName;
    return;
  }
  try {
    const cleaned = cleanUndefined({ userGivenName });
    await updateDoc(doc(db, 'trees', treeId), cleaned);
  } catch (error) {
    console.error("Firestore renameTree failed:", getErrorMessage(error));
    const tree = demoTrees.find((item) => item.id === treeId);
    if (tree) tree.userGivenName = userGivenName;
  }
}

export async function fetchSubscriptions(uid: string) {
  if (!isFirebaseConfigured || !db) return demoSubscriptions.filter((sub) => sub.userId === uid);
  try {
    const snap = await getDocs(query(collection(db, 'subscriptions'), where('userId', '==', uid), orderBy('endDate', 'desc')));
    return snap.docs.map((docSnap) => withId<Subscription>(docSnap));
  } catch (error) {
    console.warn("Firestore fetchSubscriptions failed, falling back to demo data:", getErrorMessage(error));
    return demoSubscriptions.filter((sub) => sub.userId === uid);
  }
}

export async function setAutoRenew(subscriptionId: string, autoRenew: boolean) {
  if (!isFirebaseConfigured || !db) {
    const subscription = demoSubscriptions.find((sub) => sub.id === subscriptionId);
    if (subscription) subscription.autoRenew = autoRenew;
    return;
  }
  try {
    await updateDoc(doc(db, 'subscriptions', subscriptionId), { autoRenew });
  } catch (error) {
    console.error("Firestore setAutoRenew failed:", getErrorMessage(error));
    const subscription = demoSubscriptions.find((sub) => sub.id === subscriptionId);
    if (subscription) subscription.autoRenew = autoRenew;
  }
}

export async function fetchDeliveries(uid: string) {
  if (!isFirebaseConfigured || !db) return demoDeliveries.filter((delivery) => delivery.userId === uid);
  try {
    const snap = await getDocs(query(collection(db, 'deliveries'), where('userId', '==', uid)));
    return snap.docs.map((docSnap) => withId<Delivery>(docSnap));
  } catch (error) {
    console.warn("Firestore fetchDeliveries failed, falling back to demo data:", getErrorMessage(error));
    return demoDeliveries.filter((delivery) => delivery.userId === uid);
  }
}

export async function fetchPosts() {
  if (!isFirebaseConfigured || !db) return demoPosts;
  try {
    const snap = await getDocs(query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(50)));
    return snap.docs.map((docSnap) => withId<Post>(docSnap));
  } catch (error) {
    console.warn("Firestore fetchPosts failed, falling back to demo data:", getErrorMessage(error));
    return demoPosts;
  }
}

export async function createPost(uid: string, payload: Pick<Post, 'caption' | 'type' | 'treeId'>, file?: File) {
  if (!isFirebaseConfigured || !db || !storage) {
    demoPosts.unshift({
      id: `post-${Date.now()}`,
      userId: uid,
      ...payload,
      imageUrl: file ? URL.createObjectURL(file) : '',
      likes: 0,
      likedBy: [],
      comments: [],
      timestamp: { toDate: () => new Date() } as any,
      userName: demoUser.name
    });
    return;
  }
  try {
    let imageUrl = '';
    if (file) {
      const uploadRef = ref(storage, `community/${uid}/${Date.now()}-${file.name}`);
      await uploadBytes(uploadRef, file);
      imageUrl = await getDownloadURL(uploadRef);
    }
    const cleanedPost = cleanUndefined({
      ...payload,
      userId: uid,
      imageUrl,
      likes: 0,
      likedBy: [],
      comments: [],
      timestamp: serverTimestamp()
    });
    await addDoc(collection(db, 'posts'), cleanedPost);
  } catch (error) {
    console.error("Firestore createPost failed, falling back to demo:", getErrorMessage(error));
    demoPosts.unshift({
      id: `post-${Date.now()}`,
      userId: uid,
      ...payload,
      imageUrl: file ? URL.createObjectURL(file) : '',
      likes: 0,
      likedBy: [],
      comments: [],
      timestamp: { toDate: () => new Date() } as any,
      userName: demoUser.name
    });
  }
}

export async function fetchVoiceNotes(treeId: string) {
  if (!isFirebaseConfigured || !db) return demoVoiceNotes.filter((note) => note.treeId === treeId);
  try {
    const snap = await getDocs(query(collection(db, 'voiceNotes'), where('treeId', '==', treeId), orderBy('timestamp', 'desc')));
    return snap.docs.map((docSnap) => withId<VoiceNote>(docSnap));
  } catch (error) {
    console.warn("Firestore fetchVoiceNotes failed, falling back to demo data:", getErrorMessage(error));
    return demoVoiceNotes.filter((note) => note.treeId === treeId);
  }
}

export async function uploadVoiceReply(uid: string, treeId: string, blob: Blob, replyTo?: string) {
  if (!isFirebaseConfigured || !db || !storage) {
    demoVoiceNotes.unshift({
      id: `voice-${Date.now()}`,
      treeId,
      farmerAudioUrl: '',
      replyAudioUrl: URL.createObjectURL(blob),
      replyTo,
      timestamp: { toDate: () => new Date() } as any
    });
    return;
  }
  try {
    const uploadRef = ref(storage, `voice-notes/${uid}/${treeId}-${Date.now()}.webm`);
    await uploadBytes(uploadRef, blob);
    const replyAudioUrl = await getDownloadURL(uploadRef);
    const cleanedVoiceNote = cleanUndefined({
      treeId,
      replyAudioUrl,
      replyTo,
      timestamp: serverTimestamp()
    });
    await addDoc(collection(db, 'voiceNotes'), cleanedVoiceNote);
  } catch (error) {
    console.error("Firestore uploadVoiceReply failed, falling back to demo:", getErrorMessage(error));
    demoVoiceNotes.unshift({
      id: `voice-${Date.now()}`,
      treeId,
      farmerAudioUrl: '',
      replyAudioUrl: URL.createObjectURL(blob),
      replyTo,
      timestamp: { toDate: () => new Date() } as any
    });
  }
}

export async function createDonationIntent(uid: string, amount = 100) {
  if (!isFirebaseConfigured || !db) return;
  try {
    const cleanedDonation = cleanUndefined({
      userId: uid,
      amount,
      date: serverTimestamp(),
      partnerForestLocation: { lat: 26.2389, lng: 73.0243 }
    });
    await addDoc(collection(db, 'donations'), cleanedDonation);
  } catch (error) {
    console.error("Firestore createDonationIntent failed:", getErrorMessage(error));
  }
}
