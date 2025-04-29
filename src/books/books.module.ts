import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from './schemas/book.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';
import {
  Privilege,
  PrivilegeSchema,
} from 'src/privileges/schemas/privilege.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Privilege.name, schema: PrivilegeSchema },
    ]),
  ],
  providers: [BooksService],
  controllers: [BooksController],
})
export class BooksModule {}
