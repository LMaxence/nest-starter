import { IsNotEmpty } from 'class-validator';

export class UpdatePasswordDTO {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  passwordConfirmation: string;
}
