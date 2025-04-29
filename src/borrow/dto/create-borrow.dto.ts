import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateBorrowDto {
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({})
  books: string[];

  @IsNotEmpty({})
  @IsString()
  borrowerName: string;

  @IsNotEmpty({})
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  borrowDate: string;

  @IsOptional({})
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  returnDate: string;

  @IsOptional({})
  @IsBoolean()
  returned: boolean;

  @IsOptional({})
  @IsBoolean()
  deleted: boolean;
}
