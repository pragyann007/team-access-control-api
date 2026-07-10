import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DbService {
    constructor(private readonly prisma:PrismaService){}

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
            console.log(roleData)
            if(!roleData?.id) return {message:"No roles exists"}; 


            const ifMembershipExists = await tsx.memberships.findFirst({
                
                where:{
                    userId,
                    organizationId,
                    roleId:roleData.id
                }
            })

            if(ifMembershipExists) return {error:"Membership of this user for this role in this organisation already exists"}

            const memberships = await tsx.memberships.create({
                data:{
                    userId,
                    organizationId,
                    roleId:roleData?.id,
                    joinedAt
    
                }
            })
            console.log('aich bgaswe',memberships)
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
        const {organizationId,email,tokenHash,role} = data;
        const result  = await this.prisma.$transaction(async (tsxx)=>{
            const roleData = await tsxx.roles.findFirst({
                where:{
                    name:role
                }
            })
            if(!roleData?.id) return {error:"No such id found"}

            const invitations = await tsxx.invitations.create({
                data:{
                    organizationId,
                    email,
                    roleId:roleData?.id ?? undefined,
                    tokenHash,
                  
                }
            })

            

            return invitations
        })

    }
 
}
