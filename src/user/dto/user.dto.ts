import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  @IsString()
  snsId: string;

  @IsNotEmpty()
  @IsEmail()
  useremail: string;

  @IsNotEmpty()
  @IsString()
  username: string;
}
