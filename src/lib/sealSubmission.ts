/* Firestore write for the sealed submission.

   `sealToFirestore(payload)` appends a document to the `submissions` collection
   with the seal payload plus a server timestamp and the user-agent string for
   later triage. Returns the new document id on success.

   Security rules permit `create: if true` (anyone can submit) and
   `update/delete: if false` (append-only on the server, matching the F4
   append-only contract on the client). */

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
