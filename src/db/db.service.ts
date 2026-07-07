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
            return {user}
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
        return session ;
    }

    async findOrganization(name,ownerId){
        const findIfExists = await this.prisma.organizations.findFirst({
            where:{
                name,
                ownerId
            }
        })

        return findIfExists;
    }
    async createOrganization (data){
        const {name,slug,ownerId} = data;
        const orgData = await this.prisma.organizations.create({
            data:{
                name,
                slug,
                ownerId,
                
        
            }
        })

        return orgData;
    }

    async createMemberships(payload){
        const {userId,organizationId,roleId} = payload;
        const memberships = await this.prisma.memberships.create({
            data:{
                userId,
                organizationId,
                roleId

            }
        })

        return memberships;

    }


    async createOrganizationsAndMemberships(data){
       
        const result = await this.prisma.$transaction(async (tsx)=>{
            const organization = await tsx.organizations.create({
                data:{
                    name:data.organization.name,
                    slug:data.organization.slug,
                    ownerId:data.organization.ownerId,
                    

                }
            });

            const role = await tsx.roles.findUnique({
                where:{
                    name:data.roles.name
                }
            })

            const memberships = await tsx.memberships.create({
                data:{
                    userId:data.organization.ownerId,
                    organizationId:organization.id,
                    roleId:(role as any)?.id
                }
            })

            return {organization,memberships}
        })

        return {}
    }
}
