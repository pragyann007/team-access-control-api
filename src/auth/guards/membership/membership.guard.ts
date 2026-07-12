import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { DbService } from 'src/db/db.service';

@Injectable()
export class MembershipGuard implements CanActivate {
  constructor(
    private readonly db: DbService
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const user = (req as any).user;
    let id  = Number(req.params.id);
    
    const dataPayload = {
      userId: user.sub,
      organizationId: id
    }
    const findMemberships = await this.db.findMemberships(dataPayload);

    if (!findMemberships) throw new ForbiddenException("You are unauthorised")

    const payload = {
      membershipId: findMemberships.id,
      organizationId: findMemberships.organizationId,
      roleId: findMemberships.roleId
    };

    (req as any ).memberships = payload ;
    return true;
  }
}
