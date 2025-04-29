import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from 'src/common/decorators/permissions.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Privilege } from 'src/privileges/schemas/privilege.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    const userWithRole = await this.userService.findUserWithRoleAndPermission(
      user.userId,
    );

    const userPrivileges: string[] =
      userWithRole?.role?.permissions?.map((p: Privilege) => p.name) || [];

    const hasPermission = requiredPermission.every((perm) =>
      userPrivileges.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permission');
    }

    return true;
  }
}
