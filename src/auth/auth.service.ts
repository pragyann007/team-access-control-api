import { Injectable, UnauthorizedException } from '@nestjs/common';
import { find, retry } from 'rxjs';
import { DbService } from 'src/db/db.service';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from "bcryptjs"
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {Request, Response } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private readonly db:DbService,
        private jwtService:JwtService,
        private configService:ConfigService
    ){}

    async generateTokens(userId,email){

        const accessSecret = this.configService.get<string>('JWT_ACCESS_TOKEN')
        console.log(accessSecret)
        const refreshSecret = this.configService.get<string>("JWT_REFRESH_TOKEN")

        const payload ={
            sub:userId,
            email
        }

        const accesToken = await this.jwtService.signAsync(payload,{
            secret:accessSecret,
            expiresIn:"15m"
 })

 const refreshToken = await this.jwtService.signAsync(payload,{
    secret:refreshSecret,
    expiresIn:"30d"
 })


 return {accesToken,refreshToken}
    }

    async register(data){
        const findIfExists = await this.db.findUserWithEmail(data.email);

        if(findIfExists.user){
            return findIfExists.message;
        }
        const hashedPass = await bcrypt.hash(data.password,12);

        if(hashedPass){
            data["password"]=hashedPass
            
        }
        
        const createdUser = await this.db.createUser(data);

       if(!createdUser){
        return {message:"User creation failed//"}
       }
       return createdUser ;
       
        
    }

    async login(req:Request,res:Response,data){

        const findIfExists = await this.db.findUserWithEmail(data.email)
        if(!findIfExists.user){
            return {message:"User with this email address doesnt exists."}
        }

        const validatePassword = await bcrypt.compare(data.password,findIfExists.user.password);

        if(!validatePassword){
            throw new UnauthorizedException("Invalid email or password")
        }

        const {accesToken,refreshToken} = await  this.generateTokens(findIfExists.user.name,findIfExists.user.email);



        res.cookie("refresh_token",refreshToken,{
            httpOnly:true,
            secure:false,
            maxAge:30*24*60*60*1000
        })

        const refreshTokenHash = await bcrypt.hash(refreshToken,12);

        const userIp = req.ip ;
        const isMobile = req.useragent?.isMobile;
        const isDesktop = req.useragent?.isDesktop;
        const browser = req.useragent?.browser;
        
        const deviceType = isMobile && !isDesktop?"mobile" : "desktop"
        let expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate()+30)

        const sessionPayload = {
            userId:findIfExists.user.id,
            refreshTokenHash,
            device:deviceType,
            ipAddress:userIp,
            userAgent:browser,
            expiresAt:expiryDate,
            revoked:false
        }

        const createSession = await this.db.createSessions(sessionPayload)




        return {
            message:"Token assigned sucess nd user logged in success.",
            accesToken,
            createSession
        }

    }
}
