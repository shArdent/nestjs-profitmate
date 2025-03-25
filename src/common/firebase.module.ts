import { Global, Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { App } from 'firebase-admin/app';
import { Auth } from 'firebase-admin/lib/auth/auth';
import { Firestore } from 'firebase-admin/lib/firestore';
import * as fs from 'fs';

export interface FirebaseService {
  app: App;
  auth: Auth;
  firestore: Firestore;
}

@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: (): FirebaseService => {
        const firebaseKeyFilePath = `./${process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH}`;
        const firebaseServiceAccount = JSON.parse(
          fs.readFileSync(firebaseKeyFilePath).toString(),
        );

        const app = admin.initializeApp({
          credential: admin.credential.cert(firebaseServiceAccount),
        });

        return {
          app,
          auth: app.auth(),
          firestore: app.firestore(),
        };
      },
    },
  ],

  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}
