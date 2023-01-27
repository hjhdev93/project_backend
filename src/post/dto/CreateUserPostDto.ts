import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { User } from '../../user/entity/user.entity';

export class CreateUserPostDto {
  @IsNotEmpty()
  @IsEmail()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  username: string;
}
