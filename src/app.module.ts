import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books/books.module';
import { ConfigModule } from '@nestjs/config';
import { BorrowModule } from './borrow/borrow.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { PrivilegesModule } from './privileges/privileges.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    BooksModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.DB_URI),
    NotificationModule,
    BorrowModule,
    UsersModule,
    AuthModule,
    RolesModule,
    PrivilegesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
