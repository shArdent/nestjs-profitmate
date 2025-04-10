import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RequestWithUser } from 'src/common/types/req-with-user';
import { Response } from 'express';
import { SupabaseService } from './supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {
    this.supabase = supabaseService.getClient();
  }
  async registerUser(registerDto: RegisterUserDto) {
    const { email, name, password } = registerDto;

    let returnData: any;

    this.prisma.$transaction(async (tx) => {
      let userId = '';
      const { data, error } = await this.supabase.auth.admin.createUser({
        email,
        password,
      });

      if (error) {
        throw new BadRequestException(error.message);
      }

      if (data.user) {
        userId = data.user.id;
      }

      const { id: businessId } = await tx.business.create({
        data: {
          name,
        },
      });

      await tx.profile.create({
        data: {
          name,
          id: data.user.id,
          email,
          businessId,
        },
      });

      returnData = data;
    });
    return {
      user: returnData,
    };
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: loginUserDto.email,
      password: loginUserDto.password,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      user: data.user,
    };
  }

  async refreshTokenUser(req: RequestWithUser) {
    try {
      const refreshToken = req.cookies['refreshToken'];
      if (!refreshToken) {
        throw new BadRequestException('Invalid or missing refresh token');
      }

      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return {
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
      };
    } catch (error) {
      throw new BadRequestException('Invalid or missing refresh token');
    }
  }

  async logout(res: Response) {
    res.clearCookie('refreshToken');

    return {
      statusCode: 200,
      message: 'successfully logged out',
    };
  }
}
