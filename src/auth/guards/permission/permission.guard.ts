import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DbService } from 'src/db/db.service';
import { PERMISSION_KEY } from 'src/permissions/permissions.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector:Reflector,
    private readonly db:DbService
  ){}
  async canActivate(
    context: ExecutionContext,
  ):   Promise<boolean> {
    const permissions = this.reflector.getAllAndOverride(
      PERMISSION_KEY,
      [
        context.getHandler(),
        context.getClass()
      ]
    )
    const req = context.switchToHttp().getRequest();
    const membership = req.memberships ;

    const findRoles = await this.db.findPermissions(membership.roleId);

    const hasPermissions = permissions.every(permission=>findRoles.includes(permission))

    if(!hasPermissions) throw new ForbiddenException("You are unauthorised for this task")
    return true;
  }
}
