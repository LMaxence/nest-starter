import { IsBoolean, ValidateIf, IsString, IsOptional } from 'class-validator';

export class UpdateUserDTO {
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @ValidateIf(o => o.password)
  passwordConfirmation: string;
}
