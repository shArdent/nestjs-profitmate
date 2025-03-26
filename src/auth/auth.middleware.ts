import { Injectable, NestMiddleware } from '@nestjs/common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import * as admin from 'firebase-admin';
import { RequestWithUser } from 'src/common/types/req-with-user';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: RequestWithUser, res: Response, next: () => void) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          statusCode: HttpStatusCode.Unauthorized,
          error: 'Unauthorized',
          message: 'Invalid or missing token',
        });
      }

      let idToken = authHeader.split(' ')[1];

      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        req.user = decodedToken;

        return next();
      } catch (error) {
        return res.status(401).json({
          statusCode: HttpStatusCode.Unauthorized,
          error: 'Unauthorized',
          message: 'Invalid or missing token',
        });
      }
    } catch (error) {
      return res.status(500).json({
        statusCode: HttpStatusCode.Unauthorized,
        error: 'Internal server error',
        message: 'Internal server error',
      });
    }
  }
}
