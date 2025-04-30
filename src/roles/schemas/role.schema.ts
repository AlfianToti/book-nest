import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Privilege } from 'src/privileges/schemas/privilege.schema';

@Schema()
export class Role {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Privilege' }], required: true })
  permissions: Privilege[];

  @Prop({ required: true })
  isActive: boolean;

  @Prop({ required: true, default: false })
  isDeleted: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
