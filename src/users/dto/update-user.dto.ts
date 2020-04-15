import { IsBoolean } from 'class-validator';

export class UpdateUserDTO {
  @IsBoolean()
  isActive: boolean;
}
