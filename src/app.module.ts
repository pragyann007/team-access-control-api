import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import {ConfigModule, ConfigService} from "@nestjs/config"
import { PrismaModule } from './prisma/prisma.module';
import { DbModule } from './db/db.module';
import { RedisModule } from './redis/redis.module';
import { UserModule } from './user/user.module';
import { OrganizationModule } from './organization/organization.module';
import { QueeModule } from './quee/quee.module';
import {BullModule} from "@nestjs/bullmq"
import { MailModule } from './mail/mail.module';
import { HealthModule } from './health/health.module';
import { RolesModule } from './roles/roles.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 30,
    }]),
    BullModule.forRootAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory:(configService:ConfigService)=>({
        connection:{
          host:configService.get<string>("REDIS_HOST") ?? "localhost",
          port:Number(configService.get<string>("REDIS_PORT") ?? 6379),
          password:configService.get<string>("REDIS_PASSWORD") ?? undefined
        }
      })
    }),
    DbModule,
    AuthModule,
    PrismaModule,
    RedisModule,
    UserModule,
    OrganizationModule,
    QueeModule,
    MailModule,
    HealthModule,
    RolesModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}
