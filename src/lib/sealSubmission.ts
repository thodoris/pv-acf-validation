/* Firestore write for the sealed submission.

   `sealToFirestore(payload)` appends a document to the `responses` collection
   with the seal payload plus a server timestamp and the user-agent string for
   later triage. Returns the new document id on success.

   Security rules permit `create: if true` (anyone can submit) and
   `update/delete: if false` — once written, a submission document is
   immutable on the server. The client-side immutability boundary is
   `sessionStore.submittedAt` (see ADR 0009): once set, the App-level
   guard short-circuits all screen requests to the terminal screen, so
   no second `addDoc` call can be initiated. */

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SUBMISSIONS_COLLECTION } from '@/lib/firestoreCollections';
import type { SealPayload } from '@/state/sealPayload';

export { SUBMISSIONS_COLLECTION };

export async function sealToFirestore(payload: SealPayload): Promise<string> {
  const ref = await addDoc(collection(db, SUBMISSIONS_COLLECTION), {
    ...payload,
    submittedAt: serverTimestamp(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  });
  return ref.id;
}
