import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from "@nestjs/jwt"
import { DbModule } from 'src/db/db.module';
import { RedisModule } from 'src/redis/redis.module';
import { QueeModule } from 'src/quee/quee.module';


@Module({
  imports:[
    DbModule,
    JwtModule.register({}),
    RedisModule,
    QueeModule
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
