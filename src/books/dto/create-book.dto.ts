import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  author: string;

  @Transform((year) => +year.value)
  @IsNotEmpty()
  @IsNumber()
  year: number;

  @IsOptional()
  cover: string;

  @IsOptional()
  @IsBoolean()
  availability: boolean;

  @IsOptional()
  @IsBoolean()
  deleted: boolean;
}
