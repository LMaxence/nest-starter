import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateEmailDTO {
  @IsNotEmpty()
  @IsEmail()
  newEmail: string;
}
