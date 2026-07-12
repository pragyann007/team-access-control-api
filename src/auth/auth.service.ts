import { ConflictException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import bcrypt from "bcryptjs"
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { REDIS_CLIENT } from 'src/redis/redis.constants';
import Redis from 'ioredis';
import { loginService, registerService } from './auth,types';
import * as crypto from "crypto"
import { QueeService } from 'src/quee/quee.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly db:DbService,
        private jwtService:JwtService,
        private configService:ConfigService,
        @Inject(REDIS_CLIENT) private readonly redis:Redis,
        private readonly queeService:QueeService
    ){}

    getCookieOptions(){
        const secure = this.configService.get<string>("COOKIE_SECURE") === "true"
        return {
            httpOnly:true,
            secure,
            sameSite:"strict" as const,
            maxAge:30*24*60*60*1000
        }
    }

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
        return false ; 
    }

    async register(data:registerService){
        const findIfExists = await this.db.findUserWithEmail(data.email);

        if(findIfExists.user){
            throw new ConflictException("User already registered.")
        }
        const hashedPass = await bcrypt.hash(data.password,12);

        const normaliseData = {
            ...data,
            password:hashedPass
        }
    
        const createdUser = await this.db.createUser(normaliseData);

       if(!createdUser){
        throw new InternalServerErrorException("User creation failed..")
       }
       return createdUser ;
    }

    async login(data:loginService,payload){

        const findIfExists = await this.db.findUserWithEmail(data.email)
        if(!findIfExists.user){
            throw new NotFoundException("User with this email address doesnt exists.")
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
        const key = `sessions:${findIfExists.user.id}-${payload.deviceType}`
        await this.redis.set(key,JSON.stringify(createSession),"EX",30*24*60*60);

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

        const redisSessions = await this.redis.get(key);

        if(!redisSessions) {
            throw new UnauthorizedException("No session was found ") 
        }

        const data = JSON.parse(redisSessions);
        await this.redis.del(key)
       
        const isRefreshHashMatched = await this.validateToken(refresh_token,data.refreshTokenHash)

        if(!isRefreshHashMatched) throw new UnauthorizedException("Refres Token expired or dont exists") ;

        const isSessionExpired = Date.now() > new Date(data.expiresAt).getTime();

        if(isSessionExpired) throw new UnauthorizedException("Session has already been expired ") ;

        const {accessToken,refreshToken} =await  this.generateTokens(sub,email,device);

        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

        const newSessionPayload = {
            ...data,
            refreshTokenHash
        }

        await this.redis.set(key,JSON.stringify(newSessionPayload),"EX",30*24*60*60);

        return {
            message:"token rotation success..",
            accessToken,
            refreshToken
        }
    }

    async logout(user,deviceType){

        const key = `sessions:${user.sub}-${deviceType}`
        await this.redis.del(key);
        await this.db.revokeSessionByDevice(user.sub,deviceType);
        return {message:"logged out scuesfully"}
    }

    async logoutAll(user){
        const pattern = `sessions:${user.sub}-*`
        const keys = await this.redis.keys(pattern);
        if(keys.length) await this.redis.del(...keys);
        await this.db.revokeAllSessions(user.sub);
        return {message:"logged out from all devices sucesfully"}
    }

    async getSessions(userId:number){
        const sessions = await this.db.findSessionsByUserId(userId);
        return {sessions}
    }

    async revokeSession(userId:number,sessionId:number){
        const result = await this.db.revokeSession(sessionId,userId);
        return {message:"session revoked sucesfully",result}
    }

    async forgotPasswordResetWithPassword(data){

        const findIfExists = await this.db.findUserWithEmail(data.email);

        if(!findIfExists.user) throw new NotFoundException("No email exists with this address");

        const isOldPassMatch = await bcrypt.compare(data.oldPassword,findIfExists.user.password);

        if(!isOldPassMatch) throw new UnauthorizedException("Invalid Old password");

        const updateUserPassword = await this.db.updateUserPassword(data);

        if(!updateUserPassword) throw new InternalServerErrorException("Something went wrong")

        return {message:"password changed sucessfully.",updateUserPassword}
    }

    async generateOtp(data){
        const findIfExists = await this.db.findUserWithEmail(data.email);

        if(!findIfExists.user) throw new NotFoundException("No email exists with this address");

        const key = `otp:${findIfExists.user.email}`;
        const genOtp = String(Math.floor(Math.random() * 90000000) + 10000000);

        await this.redis.set(key,genOtp,"EX",300)

        await this.queeService.enqueeForgotMail({
            to:data.email,
            otp:genOtp
        })

        return {message:"Otp generated and sent to email"}
    }

    async verifyOtp(data)
    {
        const key = `otp:${data.email}`;
        const otp  = await this.redis.get(key)

        if(data.otp !== otp) throw new ForbiddenException("Incorrect Otp..");

        await this.redis.del(key)
        const verifiedKey = `otp-verified:${data.email}`
        await this.redis.set(verifiedKey,"true","EX",300)

        return {message:"otp verified.."}
    }

    async  forgotPasswordResetWithOtp(data){
        const verifiedKey = `otp-verified:${data.email}`
        const verified = await this.redis.get(verifiedKey)
        if(!verified) throw new ForbiddenException("Otp not verified or expired")

        const updateUserPassword = await this.db.updateUserPassword(data)

        if(!updateUserPassword) throw new InternalServerErrorException("Something went wrong")

        await this.redis.del(verifiedKey)
        return {message:"Password changed sucesfully",updateUserPassword}
    }
}
