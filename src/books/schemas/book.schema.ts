import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Book {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  year: number;

  @Prop()
  cover: string;

  @Prop({ required: false, default: false })
  deleted: boolean;
}

export const BookSchema = SchemaFactory.createForClass(Book);
