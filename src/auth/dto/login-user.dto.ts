import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ description: 'Email user', example: 'udin@gmail.com' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ description: 'Password user' })
  @IsNotEmpty()
  @IsString()
  @Length(8)
  @Matches(/[a-z]/)
  @Matches(/[A-Z]/)
  @Matches(/[0-9]/)
  password: string;

  @ApiProperty({ description: 'Simpan refresh token untuk user jika true' })
  @IsBoolean()
  @IsOptional()
  remember?: boolean;
}
