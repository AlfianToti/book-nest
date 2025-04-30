import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from 'src/roles/schemas/role.schema';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  role: Role;

  @Prop({ required: true, default: false })
  isDeleted: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
