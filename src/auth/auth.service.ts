import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import bcrypt from "bcryptjs"
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {Request, Response } from 'express';
import { REDIS_CLIENT } from 'src/redis/redis.constants';
import Redis from 'ioredis';
import { loginService, registerService } from './auth,types';
import * as crypto from "crypto"
import { create } from 'domain';

@Injectable()
export class AuthService {
    constructor(
        private readonly db:DbService,
        private jwtService:JwtService,
        private configService:ConfigService,
        @Inject(REDIS_CLIENT) private readonly redis:Redis
    ){}

    async generateTokens(userId:number,email:string,device:string){

        const accessSecret = this.configService.get<string>('JWT_ACCESS_TOKEN')
        const refreshSecret = this.configService.get<string>("JWT_REFRESH_TOKEN")

        const payload ={
            sub:userId,
            email,
            device
        }

        const accessToken = await this.jwtService.signAsync(payload,{
            secret:accessSecret,
            expiresIn:"70m"
 })

 const refreshToken = await this.jwtService.signAsync(payload,{
    secret:refreshSecret,
    expiresIn:"30d"
 })


 return {accessToken,refreshToken}
    }


    async hashToken (token:string){
        return crypto.createHash("sha256").update(token).digest("hex")
    }

    async validateToken(refresh_token,refreshTokenHash){
        const refresh_token_hash =await  this.hashToken(refresh_token);

        if(refreshTokenHash===refresh_token_hash){
            return true ; 
        }
        else{
            return false ; 
        }

    }
    async register(data:registerService){
        const findIfExists = await this.db.findUserWithEmail(data.email);

        if(findIfExists.user){
            return {message:"User already registered."};
        }
        const hashedPass = await bcrypt.hash(data.password,12);

        const normaliseData = {
            ...data,
            password:hashedPass
        }
    
        const createdUser = await this.db.createUser(normaliseData);

       if(!createdUser){
        return {message:"User creation failed.."}
       }
       return createdUser ;
       
        
    }

    async login(data:loginService,payload){

        const findIfExists = await this.db.findUserWithEmail(data.email)
        if(!findIfExists.user){
            return {message:"User with this email address doesnt exists."}
        }

        const validatePassword = await bcrypt.compare(data.password,findIfExists.user.password);

        if(!validatePassword){
            throw new UnauthorizedException("Invalid email or password")
        }

  
        
     
        let expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate()+30)

        const {accessToken,refreshToken} = await this.generateTokens(findIfExists.user.id,findIfExists.user.email,payload.deviceType);



      

        const refreshTokenHash = await this.hashToken(refreshToken)

        const sessionPayload = {
            userId:findIfExists.user.id,
            refreshTokenHash,
            device:payload.deviceType,
            ipAddress:payload.userIp,
            userAgent:payload.browser,
            expiresAt:expiryDate,
            revoked:false
        }

        const createSession = await this.db.createSessions(sessionPayload);
        console.log("sessiondb",createSession)
        const key = `sessions:${findIfExists.user.id}-${payload.deviceType}`
        await this.redis.set(key,JSON.stringify(createSession));




        return {
            message:"Token assigned sucess nd user logged in success.",
            accessToken,
            refreshToken,
            createSession
        }

    }

    async refresh(refresh_token){
       
        const refreshSecret = this.configService.get<string>("JWT_REFRESH_TOKEN")

        if(!refresh_token) throw new UnauthorizedException("No token receieved.")

            const decode_token = await this.jwtService.verifyAsync(refresh_token, { secret: refreshSecret });

            const {sub,email,device} = decode_token ;
             const key = `sessions:${sub}-${device}`;

             console.log(key)
             const redisSessions = await this.redis.get(key);
             console.log(redisSessions)

             if(!redisSessions) {
                 throw new UnauthorizedException("No session was found ") 
                 }

             const data = JSON.parse(redisSessions);
             await this.redis.del(key)



             console.log("rt",refresh_token);
             console.log("rth",data.refreshTokenHash)
           
            const isRefreshHashMatched = await this.validateToken(refresh_token,data.refreshTokenHash)

            console.log(isRefreshHashMatched)


             if(!isRefreshHashMatched) throw new UnauthorizedException("Refres Token expired or dont exists") ;

             const isSessionExpired = Date.now() > new Date(data.expiresAt).getTime();

             if(isSessionExpired) throw new UnauthorizedException("Session has already been expired ") ;

            //  generate new tokens;
            console.log("2finish")


            const {accessToken,refreshToken} =await  this.generateTokens(sub,email,device);

            const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

            const newSessionPayload = {
                ...data,
                refreshTokenHash
            }
            


            await this.redis.set(key,JSON.stringify(newSessionPayload));
            console.log("finish")

            return {
                message:"token rotation success..",
                accessToken,
                refreshToken
            }
    }
}
