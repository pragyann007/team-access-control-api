import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import {ConfigModule} from "@nestjs/config"
import { PrismaModule } from './prisma/prisma.module';
import { BullModule } from "@nestjs/bullmq"
import { DbModule } from './db/db.module';

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
    DbModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
