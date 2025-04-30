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
  title: string;

  @IsNotEmpty()
  author: string;

  @Transform((year) => +year.value)
  @IsNotEmpty()
  @IsNumber()
  year: number;

  @IsOptional()
  cover: string;

  @IsOptional()
  @IsBoolean()
  deleted: boolean;
}
