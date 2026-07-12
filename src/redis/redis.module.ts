import { Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from "ioredis"
import {REDIS_CLIENT} from "./redis.constants"

@Module({
    imports:[ConfigModule],
    providers:[
        {
            provide:REDIS_CLIENT,
            inject:[ConfigService],
            useFactory:(configService:ConfigService)=>{
                return new Redis({
                    host:configService.get<string>("REDIS_HOST") ?? "localhost",
                    port:Number(configService.get<string>("REDIS_PORT") ?? 6379),
                    password:configService.get<string>("REDIS_PASSWORD") ?? undefined
                })
            }
        }
    ],

    exports:[REDIS_CLIENT]
})
export class RedisModule implements OnModuleDestroy {
    constructor(){}
    onModuleDestroy() {
        
    }
}
