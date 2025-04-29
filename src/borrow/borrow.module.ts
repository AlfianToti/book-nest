import { Module } from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { BorrowController } from './borrow.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Borrow, BorrowSchema } from './schemas/borrow.schema';
import { Book, BookSchema } from 'src/books/schemas/book.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';
import {
  Privilege,
  PrivilegeSchema,
} from 'src/privileges/schemas/privilege.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Borrow.name,
        schema: BorrowSchema,
      },
      {
        name: Book.name,
        schema: BookSchema,
      },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Privilege.name, schema: PrivilegeSchema },
    ]),
  ],
  controllers: [BorrowController],
  providers: [BorrowService],
})
export class BorrowModule {}
