import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { Book } from 'src/books/schemas/book.schema';

@Schema({ timestamps: true })
export class Borrow extends Document {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Book' }], required: true })
  books: Book[];
  @Prop({ required: true })
  borrowerName: string;
  @Prop({ required: true })
  borrowDate: Date;
  @Prop({ required: true })
  returnDate: Date;
  @Prop({ required: true, default: false })
  returned: boolean;
  @Prop({ required: true, default: false })
  deleted: boolean;
}

export const BorrowSchema = SchemaFactory.createForClass(Borrow);
