import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

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
}
