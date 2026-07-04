import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from "@nestjs/jwt"
import { DbModule } from 'src/db/db.module';


@Module({
  imports:[
    DbModule,
    JwtModule.register({})
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
