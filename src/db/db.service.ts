import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DbService {
    constructor(private readonly prisma:PrismaService){}

    async findUserWithEmail (email){

        const user = await this.prisma.user.findFirst({
            where:{
                email
            }
        })

        if(user){
            return {message:"User already exists",user}
        }
        return {message:"No user with this email in db."}

    }

    async createUser(data){
        const {name,email,password} = data ; 
        const user = await this.prisma.user.create({
            data:{
                name:data.name,
                email:data.email,
                password:data.password,
 }
        })

        if(user){
            return user ;
        }
        return null ; 
    }

    async createSessions (sessionPayload){
       
        const {userId,refreshTokenHash,device,ipAddress,userAgent,revoked,expiresAt} = sessionPayload;
        const session = await this.prisma.sessions.create({
            data:{
                userId,
                refreshTokenHash,
                device,
                ipAddress,
                userAgent,
                revoked,
                expiresAt,
               
            }

        })
    }
}
