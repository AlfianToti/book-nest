import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Privilege {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  isActive: boolean;

  @Prop({ required: true, default: false })
  isDeleted: boolean;
}

export const PrivilegeSchema = SchemaFactory.createForClass(Privilege);
