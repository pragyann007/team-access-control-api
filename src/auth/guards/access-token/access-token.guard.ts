import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private  jwtService:JwtService,
    private readonly configService:ConfigService
  ){
  }
   async canActivate(
    context: ExecutionContext,
  ):  Promise<boolean>  {

    const req:Request = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization ;
    const token = authHeader?.split(" ")[1];

    if(!authHeader || !authHeader.startsWith("Bearer") || !token ) throw new UnauthorizedException("No token found")

try {
  const payload  = await this.jwtService.verifyAsync(token,{secret:this.configService.get<string>("JWT_ACCESS_TOKEN")});
  (req as any ).user = payload;
  return true;
} catch (error) {
  throw new UnauthorizedException("Invalid or expired token")
}
  }
}
