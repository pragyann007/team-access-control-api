import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import {ConfigModule} from "@nestjs/config"
import { PrismaModule } from './prisma/prisma.module';
import { DbModule } from './db/db.module';
import { RedisModule } from './redis/redis.module';
import { UserModule } from './user/user.module';
import { OrganizationModule } from './organization/organization.module';
import { QueeModule } from './quee/quee.module';
import {BullModule} from "@nestjs/bullmq"
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    DbModule,
    BullModule.forRoot({
      connection:{
        host:"localhost",
        port:6379,
        password:"admin123"
      }

    }),
    
    ConfigModule.forRoot({isGlobal:true}),
    
    AuthModule,
    PrismaModule,
    DbModule,
    RedisModule,
    UserModule,
    OrganizationModule,
    QueeModule,
    MailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
