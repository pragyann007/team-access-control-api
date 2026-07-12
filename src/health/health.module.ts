import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports:[PrismaModule,RedisModule],
  controllers: [HealthController],
})
export class HealthModule {}
