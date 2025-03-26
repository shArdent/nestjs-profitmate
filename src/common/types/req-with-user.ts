import { Request } from 'express';
import * as admin from 'firebase-admin';

export interface RequestWithUser extends Request {
  user?: admin.auth.DecodedIdToken;
}
