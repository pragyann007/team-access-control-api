import { Module, OnModuleDestroy } from '@nestjs/common';
import redis, { Redis } from "ioredis"
import {REDIS_CLIENT} from "./redis.constants"

@Module({
    providers:[
        {
            provide:REDIS_CLIENT,
            useFactory:()=>{
                return new Redis({
                    host:"localhost",
                    port:6379,
                    password:"admin123"
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
