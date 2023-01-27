import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdatePostDto {
  @IsNotEmpty()
  @IsEmail()
  title?: string;

  @IsNotEmpty()
  @IsString()
  description?: string;

  @IsNumber()
  photoId?: Array<number>;

  @IsString()
  photoKey?: Array<string>;

  @IsNumber()
  recordId?: number;

  @IsString()
  recordKey?: string;
}
