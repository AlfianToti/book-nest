import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { PermissionsGuard } from './permissions.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      useClass: JwtAuthGuard,
      provide: APP_GUARD,
    },
    {
      useClass: PermissionsGuard,
      provide: APP_GUARD,
    },
  ],
})
export class AuthModule {}
