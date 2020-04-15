import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestPasswordUpdateDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
