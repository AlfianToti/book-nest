import {
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateBorrowDto {
  @IsMongoId({})
  book: string;

  @IsNotEmpty({})
  borrowerName: string;

  @IsNotEmpty({})
  @IsString({})
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  borrowDate: string;

  @IsOptional({})
  @IsString({})
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  returnDate: string;

  @IsOptional({})
  returned: boolean;

  @IsOptional({})
  deleted: boolean;
}
