import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import {ConfigModule} from "@nestjs/config"
import { PrismaModule } from './prisma/prisma.module';
import { BullModule } from "@nestjs/bullmq"
import { DbModule } from './db/db.module';
import { RedisModule } from './redis/redis.module';
import { UserModule } from './user/user.module';
import { OrganizationModule } from './organization/organization.module';

@Module({
  imports: [
    DbModule,
    
    ConfigModule.forRoot({isGlobal:true}),
    BullModule.forRoot({
      connection:{
        host:"localhost",
        port:6379
      }
    }),
    
    AuthModule,
    PrismaModule,
    DbModule,
    RedisModule,
    UserModule,
    OrganizationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
