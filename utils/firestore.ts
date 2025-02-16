// lib/firestore.ts
import { Firestore } from '@google-cloud/firestore';

let firestore: Firestore;

export const getFirestore = (): Firestore => {
  if (!firestore) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON as string);

    firestore = new Firestore({
      projectId: serviceAccount.project_id,
      credentials: {
        client_email: serviceAccount.client_email,
        // Note: If you stored the private key with actual newline characters,
        //       you might not need to do replace(). Only do this if you see
        //       "invalid PEM" errors.
        private_key: serviceAccount.private_key,
      },
    });
  }

  return firestore;
};
