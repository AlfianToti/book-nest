import { Module } from '@nestjs/common';
import { PrivilegesService } from './privileges.service';
import { PrivilegesController } from './privileges.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Privilege, PrivilegeSchema } from './schemas/privilege.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Privilege.name, schema: PrivilegeSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [PrivilegesController],
  providers: [PrivilegesService],
  exports: [PrivilegesService],
})
export class PrivilegesModule {}
