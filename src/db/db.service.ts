import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from "crypto"
import bcrypt from "bcryptjs"

@Injectable()
export class DbService {
    constructor(private readonly prisma:PrismaService){}

    hashToken(token:string){
        return crypto.createHash("sha256").update(token).digest("hex")
    }

    async findUserWithEmail (email){

        const user = await this.prisma.user.findUnique({
            where:{
                email
            }
        })

        if(user){
            return {user}
        }
        return {message:"No user with this email in db."}

    }

    async findUserById(id:number){
        const user = await this.prisma.user.findUnique({
            where:{id},
            select:{
                id:true,
                name:true,
                email:true,
                createdAt:true,
                updatedAt:true
            }
        })
        return user;
    }

    async createUser(data){
        const user = await this.prisma.user.create({
            data:{
                name:data.name,
                email:data.email,
                password:data.password,
            },
            select:{
                id:true,
                name:true,
                email:true,
                createdAt:true,
                updatedAt:true
            }
        })

        if(user){
            return user ;
        }
        return null ; 
    }

    async updateUserProfile(userId:number,data){
        const user = await this.prisma.user.update({
            where:{id:userId},
            data:{
                name:data.name,
                email:data.email
            },
            select:{
                id:true,
                name:true,
                email:true,
                createdAt:true,
                updatedAt:true
            }
        })
        return user;
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

    async findSessionsByUserId(userId:number){
        return this.prisma.sessions.findMany({
            where:{
                userId,
                revoked:false
            },
            select:{
                id:true,
                device:true,
                ipAddress:true,
                userAgent:true,
                expiresAt:true,
                revoked:true
            }
        })
    }

    async revokeSession(sessionId:number,userId:number){
        return this.prisma.sessions.updateMany({
            where:{
                id:sessionId,
                userId,
                revoked:false
            },
            data:{
                revoked:true,
                revokedAt:new Date()
            }
        })
    }

    async revokeAllSessions(userId:number){
        return this.prisma.sessions.updateMany({
            where:{
                userId,
                revoked:false
            },
            data:{
                revoked:true,
                revokedAt:new Date()
            }
        })
    }

    async revokeSessionByDevice(userId:number,device:string){
        return this.prisma.sessions.updateMany({
            where:{
                userId,
                device,
                revoked:false
            },
            data:{
                revoked:true,
                revokedAt:new Date()
            }
        })
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

    async findOrganizationById(id:number){
        return this.prisma.organizations.findUnique({
            where:{id},
            include:{
                owner:{
                    select:{id:true,name:true,email:true}
                }
            }
        })
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

    async updateOrganization(id:number,data){
        return this.prisma.organizations.update({
            where:{id},
            data:{
                name:data.name,
                slug:data.slug
            }
        })
    }

    async deleteOrganization(id:number){
        return this.prisma.$transaction(async(tsx)=>{
            await tsx.auditLogs.deleteMany({where:{organizationId:id}})
            await tsx.invitations.deleteMany({where:{organizationId:id}})
            await tsx.memberships.deleteMany({where:{organizationId:id}})
            return tsx.organizations.delete({where:{id}})
        })
    }

    async createMemberships(payload){
        const {userId,organizationId,role,joinedAt} = payload;

        const result = await this.prisma.$transaction(async(tsx)=>{
            const roleData = await tsx.roles.findFirst({
                where:{
                    name:{
                        equals:role,
                        mode:"insensitive"
                    }
                }
            })
            if(!roleData?.id) return {message:"No roles exists"}; 

            const ifMembershipExists = await tsx.memberships.findFirst({
                where:{
                    userId,
                    organizationId
                }
            })

            if(ifMembershipExists) return {error:"Membership of this user in this organisation already exists"}

            const memberships = await tsx.memberships.create({
                data:{
                    userId,
                    organizationId,
                    roleId:roleData?.id,
                    joinedAt
                }
            })

            return memberships;
        })
       
        return result;
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

            if(!role?.id) return {error:"OWNER role not found. Please run database seed."}

            const memberships = await tsx.memberships.create({
                data:{
                    userId:data.organization.ownerId,
                    organizationId:organization.id,
                    roleId:role.id
                }
            })

            return {organization,memberships}
        })

        return result
    }

    async findMemberships(data){
        const {userId,organizationId}  = data ;
        const membership = await this.prisma.memberships.findFirst({
            where:{
                userId,
                organizationId
            },
        })

        return membership;
    }

    async findUserOrganizations(userId:number){
        const memberships = await this.prisma.memberships.findMany({
            where:{userId},
            include:{
                organization:true,
                roles:true
            }
        })
        return memberships;
    }

    async findOrgMembers(organizationId:number){
        return this.prisma.memberships.findMany({
            where:{organizationId},
            include:{
                user:{
                    select:{id:true,name:true,email:true}
                },
                roles:true
            }
        })
    }

    async removeMember(organizationId:number,userId:number){
        return this.prisma.memberships.deleteMany({
            where:{
                organizationId,
                userId
            }
        })
    }

    async updateMemberRole(organizationId:number,userId:number,role:string){
        const result = await this.prisma.$transaction(async(tsx)=>{
            const roleData = await tsx.roles.findFirst({
                where:{
                    name:{
                        equals:role,
                        mode:"insensitive"
                    }
                }
            })
            if(!roleData?.id) return {error:"No role exists"}

            const updated = await tsx.memberships.updateMany({
                where:{
                    organizationId,
                    userId
                },
                data:{
                    roleId:roleData.id
                }
            })
            return updated;
        })
        return result;
    }

    async findPermissions(roleId){
        const permissions = await this.prisma.role_permissions.findMany({
            where:{
                roleId
            },
           select:{
            permission:{
                select:{
                    name:true
                }
            }
           }
        })
        const permission = permissions.map((prm)=>prm.permission.name)

        return permission ; 
    }

    async findAllRoles(){
        return this.prisma.roles.findMany()
    }

    async findRolePermissions(roleId:number){
        return this.prisma.role_permissions.findMany({
            where:{roleId},
            include:{
                permission:true
            }
        })
    }

    async findIfUserInOrg(uid,orgId){
        const res = await this.prisma.memberships.findFirst({
            where:{
                userId:uid,
                organizationId:orgId
            }
        })
        return res ; 
    }

    async getOrgName(orgId){
        const res = await this.prisma.organizations.findUnique({
            where:{
                id:orgId
            }
        })
        return res ;
    }

    async createInvitation(data){
        const {organizationId,email,tokenHash,role,userId,ipAddress,userAgent,expiresAt} = data;
        const result  = await this.prisma.$transaction(async (tsxx)=>{
            const roleData = await tsxx.roles.findFirst({
                where:{
                    name:role
                }
            })
            if(!roleData?.id) return {error:"No such role found"}

            const invitations = await tsxx.invitations.create({
                data:{
                    organizationId,
                    email,
                    roleId:roleData.id,
                    tokenHash,
                    expiresAt
                }
            })
            await tsxx.auditLogs.create({
                data:{
                    userId,
                    organizationId,
                    action:"invitation_sent",
                    resource:"organization",
                    ipAddress,
                    userAgent,
                }
            })

            return invitations
        })
        return result;
    }

    async findInvitationByTokenHash(tokenHash:string){
        return this.prisma.invitations.findFirst({
            where:{tokenHash},
            include:{role:true}
        })
    }

    async findPendingInvitations(organizationId:number){
        return this.prisma.invitations.findMany({
            where:{
                organizationId,
                acceptedAt:null
            },
            include:{role:true}
        })
    }

    async revokeInvitation(invitationId:number,organizationId:number){
        return this.prisma.invitations.deleteMany({
            where:{
                id:invitationId,
                organizationId,
                acceptedAt:null
            }
        })
    }

    async acceptInvitationRecord(invitationId:number){
        return this.prisma.invitations.update({
            where:{id:invitationId},
            data:{acceptedAt:new Date()}
        })
    }

    async createAuditLog(data){
        return this.prisma.auditLogs.create({data})
    }

    async findAuditLogs(organizationId:number,page:number=1,limit:number=20){
        const skip = (page-1)*limit;
        const [logs,total] = await Promise.all([
            this.prisma.auditLogs.findMany({
                where:{organizationId},
                orderBy:{createdAt:"desc"},
                skip,
                take:limit,
                include:{
                    user:{select:{id:true,name:true,email:true}}
                }
            }),
            this.prisma.auditLogs.count({where:{organizationId}})
        ])
        return {logs,total,page,limit}
    }

    async updateUserPassword(data){
        const hashedPass = await bcrypt.hash(data.newPassword,12);
        const user = await this.prisma.user.update({
            where:{
                email:data.email
            },
            data:{
                password:hashedPass
            },
            select:{
                id:true,
                name:true,
                email:true
            }
        })
        return user ; 
    }
 
    async checkifMembership(data){
        const result = await this.prisma.memberships.findFirst({
            where:{
                userId:data.userId,
                organizationId:data.orgId,
            }
        })
        return result;
    }
}
