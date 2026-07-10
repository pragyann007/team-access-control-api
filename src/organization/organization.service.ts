import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DbService } from 'src/db/db.service';
import * as crypto from "crypto"
import { QueeService } from 'src/quee/quee.service';
@Injectable()
export class OrganizationService {
    constructor(
        private readonly jwtService:JwtService,
        private readonly db:DbService,
        private readonly configService:ConfigService,
        private readonly QueeService:QueeService
    ){
    }

    async createOrganization(data,user){
        console.log(user)
        if(!data.slug){
            data.slug = data.name.toLowerCase()
        }
        const dataPayload = {
            name:data.name,
            slug:data.slug,
            ownerId:user.sub,
            
        }
        const exists = await this.db.findOrganization(dataPayload.name,dataPayload.ownerId)

        if(exists){
            throw new ConflictException("Organization already exists")
        }



        const dataPayloads = {
            organization:{
                name:data.name,
                slug:data.slug,
                ownerId:user.sub,

            },
            roles:{
                name:"OWNER"
            },
        }


        const datas  = await this.db.createOrganizationsAndMemberships(dataPayloads)


        return {message:"Organization and memberships Created Succesfully",datas}



    }

    async inviteMemerToOrganization(data,user,orgId){
        const findThisUser = await this.db.findUserWithEmail(data.email);
        let registeredUser = findThisUser.user?true:false;
        if(registeredUser){
            const ifUserExistsALready = await this.db.findIfUserInOrg(findThisUser.user?.id,orgId);

            if(ifUserExistsALready) throw new ConflictException("This user is already in this organization.")
        }

        let invitePayload = {
            orgId,
            role:data.role,
            isRegsitered:registeredUser
        }

        let inviteToken = await  this.jwtService.sign(invitePayload,{
            secret:this.configService.get<string>("INVITE_TOKEN")
        })


        let inviteLink = `${this.configService.get<string>("SERVER_URL")}/organizations/invite/accept/${inviteToken}`;

        let org = await this.db.getOrgName(orgId);
        if(!org){
            throw new NotFoundException("No organization exists ...")
        }
        let orgName = org.name ; 
        

        const mailDataPayload = {
            to:data.email,
            orgName,
            inviteLink
        }

        await this.QueeService.enqueeMail(mailDataPayload);

        let invitationPayload = {
            organizationId:orgId,
            email:user.email,
            role:data.role,
            tokenHash:inviteToken
  }

  const invitationCreated = await this.db.createInvitation(invitationPayload);


         return {message:"Invitation Sent Succesfully",invitationCreated};


    }

    async acceptInvitations(req,inviteId){

        const verified = await this.jwtService.verifyAsync(inviteId,{
            secret:this.configService.get<string>("INVITE_TOKEN")
        })
     

        let {orgId,role,isRegsitered} = verified;

        const user = req.user ;
        console.log('rbw',user);

        let epochMs = Date.now();
        let joinedAt = new Date(epochMs).toISOString()

        let membershipPayload = {
            userId:user.sub,
            organizationId:orgId,
            role,
            joinedAt

        }
        let membershipCreated =await this.db.createMemberships(membershipPayload)
        console.log('ldq',membershipCreated)
        return {message:"Invitation accepted sucesfully.",membershipCreated}

        

    }
}
