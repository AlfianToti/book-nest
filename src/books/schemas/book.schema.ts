import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Book {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true, default: null })
  cover: string;

  @Prop({ required: true, default: true })
  availability: boolean;

  @Prop({ required: true, default: false })
  deleted: boolean;
}

export const BookSchema = SchemaFactory.createForClass(Book);
