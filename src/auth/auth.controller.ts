import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RequestWithUser } from 'src/common/types/req-with-user';
import { Response } from 'express';
import { HttpStatusCode } from 'axios';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    const { idToken, refreshToken, userId } =
      await this.authService.loginUser(loginUserDto);

    if (loginUserDto.remember) {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
    }

    return res.status(200).json({
      statusCode: HttpStatusCode.Ok,
      message: 'success',
      data: {
        idToken,
        userId,
      },
    });
  }

  @Post('refresh')
  async refresh(@Req() req: RequestWithUser, @Res() res: Response) {
    const { newIdToken, newRefreshToken } =
      await this.authService.refreshTokenUser(req);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.status(200).json({
      statusCode: HttpStatusCode.Ok,
      message: 'success',
      data: {
        newIdToken,
      },
    });
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    return await this.authService.logout(res);
  }
}
