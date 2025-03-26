import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { FirebaseService } from 'src/common/firebase.module';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from 'src/user/user.service';
import { LoginUserDto } from './dto/login-user.dto';
import axios from 'axios';
import { RequestWithUser } from 'src/common/types/req-with-user';

@Injectable()
export class AuthService {
  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebase: FirebaseService,
    private readonly userService: UserService,
  ) {}

  private FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

  async decodeToken(token: string): Promise<DecodedIdToken> {
    return this.firebase.auth.verifyIdToken(token);
  }

  async getUserById(uid: string): Promise<UserRecord> {
    return this.firebase.auth.getUser(uid);
  }

  async getUserByEmail(email: string): Promise<UserRecord> {
    return this.firebase.auth.getUserByEmail(email);
  }

  async isUserExist(email: string): Promise<boolean> {
    try {
      await this.firebase.auth.getUserByEmail(email);
      return true;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return false;
      }
      throw new InternalServerErrorException('Gagal mengecek user');
    }
  }

  async registerUser(registerDto: RegisterUserDto) {
    const { password, businessName, email, name } = registerDto;

    const isUserExist = await this.isUserExist(email);
    if (isUserExist) {
      throw new ConflictException('Email anda sudah terdaftar');
    }

    const userRecord = await this.firebase.auth.createUser({
      displayName: name,
      email,
      password,
    });

    const createUserData = {
      userId: userRecord.uid,
      email,
      name,
      businessName,
    };

    await this.userService.create(createUserData);

    return createUserData;
  }

  async loginUser(loginUserDto: LoginUserDto) {
    try {
      const { email, password } = loginUserDto;

      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.FIREBASE_API_KEY}`,
        {
          email,
          password,
          returnSecureToken: true,
        },
      );

      const { idToken, refreshToken, localId } = response.data;

      return {
        userId: localId,
        email,
        idToken,
        refreshToken,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async refreshTokenUser(req: RequestWithUser) {
    try {
      if (!req.headers.refreshtoken) {
        throw new BadRequestException('Invalid or missing refresh token');
      }
      const newTokens = await this.refreshToken(
        req.headers.refreshtoken as string,
      );

      return {
        newIdToken: newTokens.id_token,
        newRefreshToken: newTokens.refresh_token,
      };
    } catch (error) {
      throw new BadRequestException('Invalid or missing refresh token');
    }
  }

  private async refreshToken(refreshToken: string) {
    const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
    const res = await axios.post(
      `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
      { grant_type: 'refresh_token', refresh_token: refreshToken },
    );
    return res.data;
  }
}
