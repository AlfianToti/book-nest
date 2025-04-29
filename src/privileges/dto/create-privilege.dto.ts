import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePrivilegeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted: boolean;
}
