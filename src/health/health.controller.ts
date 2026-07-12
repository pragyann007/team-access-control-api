import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma/prisma.service';
import { REDIS_CLIENT } from 'src/redis/redis.constants';
import Redis from 'ioredis';

@ApiTags("Health")
@Controller()
export class HealthController {

    constructor(
        private readonly prisma:PrismaService,
        @Inject(REDIS_CLIENT) private readonly redis:Redis
    ){}

    @ApiOperation({summary:"Health check"})
    @Get("health")
    async health(){
        let dbOk = false;
        let redisOk = false;

        try {
            await this.prisma.$queryRaw`SELECT 1`;
            dbOk = true;
        } catch(e){}

        try {
            const pong = await this.redis.ping();
            redisOk = pong === "PONG";
        } catch(e){}

        return {
            status: dbOk && redisOk ? "ok" : "degraded",
            database: dbOk ? "connected" : "disconnected",
            redis: redisOk ? "connected" : "disconnected",
            timestamp: new Date().toISOString()
        }
    }

    @ApiOperation({summary:"Readiness probe"})
    @Get("ready")
    async ready(){
        await this.prisma.$queryRaw`SELECT 1`;
        await this.redis.ping();
        return {status:"ready",timestamp:new Date().toISOString()}
    }
}
