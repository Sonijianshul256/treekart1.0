import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, isFirebaseConfigured, storage } from '@/lib/firebase';

export async function uploadFarmerVoiceNote(uid: string, treeId: string, file: File) {
  if (!isFirebaseConfigured || !db || !storage) return;
  const uploadRef = ref(storage, `voice-notes/${uid}/farmer-${treeId}-${Date.now()}-${file.name}`);
  await uploadBytes(uploadRef, file);
  const farmerAudioUrl = await getDownloadURL(uploadRef);
  await addDoc(collection(db, 'voiceNotes'), {
    treeId,
    farmerAudioUrl,
    timestamp: serverTimestamp()
  });
}
