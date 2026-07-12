import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DbService } from 'src/db/db.service';
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
        if(!data.slug){
            data.slug = data.name.toLowerCase().replace(/\s+/g,"-")
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

        if((datas as any)?.error){
            throw new NotFoundException((datas as any).error)
        }

        return {message:"Organization and memberships Created Succesfully",datas}
    }

    async getOrganization(orgId:number){
        const org = await this.db.findOrganizationById(orgId);
        if(!org) throw new NotFoundException("No organization exists ...")
        return {organization:org}
    }

    async updateOrganization(orgId:number,data){
        const org = await this.db.getOrgName(orgId);
        if(!org) throw new NotFoundException("No organization exists ...")

        const updated = await this.db.updateOrganization(orgId,{
            name:data.name ?? org.name,
            slug:data.slug ?? org.slug
        })
        return {message:"Organization updated sucesfully",organization:updated}
    }

    async deleteOrganization(orgId:number){
        const org = await this.db.getOrgName(orgId);
        if(!org) throw new NotFoundException("No organization exists ...")

        const deleted = await this.db.deleteOrganization(orgId)
        return {message:"Organization deleted sucesfully",organization:deleted}
    }

    async getMembers(orgId:number){
        const members = await this.db.findOrgMembers(orgId)
        return {members}
    }

    async removeMember(orgId:number,userId:number,actorId:number,ip:string,userAgent:string){
        const result = await this.db.removeMember(orgId,userId)
        await this.db.createAuditLog({
            userId:actorId,
            organizationId:orgId,
            action:"member_removed",
            resource:"organization",
            ipAddress:ip,
            userAgent
        })
        return {message:"Member removed sucesfully",result}
    }

    async updateMemberRole(orgId:number,userId:number,role:string,actorId:number,ip:string,userAgent:string){
        const result = await this.db.updateMemberRole(orgId,userId,role)
        if((result as any)?.error) throw new NotFoundException((result as any).error)

        await this.db.createAuditLog({
            userId:actorId,
            organizationId:orgId,
            action:"member_role_updated",
            resource:"organization",
            ipAddress:ip,
            userAgent
        })
        return {message:"Member role updated sucesfully",result}
    }

    async getInvitations(orgId:number){
        const invitations = await this.db.findPendingInvitations(orgId)
        return {invitations}
    }

    async revokeInvitation(orgId:number,inviteId:number){
        const result = await this.db.revokeInvitation(inviteId,orgId)
        return {message:"Invitation revoked sucesfully",result}
    }

    async getAuditLogs(orgId:number,page:number,limit:number){
        const result = await this.db.findAuditLogs(orgId,page,limit)
        return result
    }

    async inviteMemerToOrganization(data,user,orgId,ip,userAgent){
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

        let inviteToken = await this.jwtService.sign(invitePayload,{
            secret:this.configService.get<string>("INVITE_TOKEN"),
            expiresIn:"7d"
        })

        let inviteLink = `${this.configService.get<string>("SERVER_URL")}/organization/invite/accept?token=${inviteToken}`;

        let org = await this.db.getOrgName(orgId);
        if(!org){
            throw new NotFoundException("No organization exists ...")
        }

        const tokenHash = this.db.hashToken(inviteToken)
        let expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate()+7)

        const mailDataPayload = {
            to:data.email,
            orgName:org.name,
            inviteLink
        }

        await this.QueeService.enqueeMail(mailDataPayload);

        let invitationPayload = {
            organizationId:orgId,
            email:data.email,
            role:data.role,
            tokenHash,
            userId:user.sub,
            ipAddress:ip,
            userAgent,
            expiresAt
        }

        const invitationCreated = await this.db.createInvitation(invitationPayload);

        return {message:"Invitation Sent Succesfully",invitationCreated};
    }

    async acceptInvitations(req,inviteId,ip,userAgent){

        let verified ;
        try {
            verified = await this.jwtService.verifyAsync(inviteId,{
                secret:this.configService.get<string>("INVITE_TOKEN")
            })
        } catch (error) {
            throw new UnauthorizedException("Invalid or expired invitation token")
        }

        const user = req.user ;
        let {orgId,role} = verified;

        const tokenHash = this.db.hashToken(inviteId)
        const invitation = await this.db.findInvitationByTokenHash(tokenHash)

        if(!invitation) throw new NotFoundException("Invitation not found")
        if(invitation.acceptedAt) throw new ConflictException("Invitation already accepted")
        if(invitation.expiresAt && Date.now() > new Date(invitation.expiresAt).getTime()){
            throw new ForbiddenException("Invitation has expired")
        }

        const existingMembership = await this.db.checkifMembership({
            userId:user.sub,
            orgId
        })
        if(existingMembership) throw new ConflictException("You are already a member of this organization")

        let epochMs = Date.now();
        let joinedAt = new Date(epochMs).toISOString()

        let membershipPayload = {
            userId:user.sub,
            organizationId:orgId,
            role,
            joinedAt
        }
        let membershipCreated = await this.db.createMemberships(membershipPayload)

        if((membershipCreated as any)?.error){
            throw new ConflictException((membershipCreated as any).error)
        }

        await this.db.acceptInvitationRecord(invitation.id)

        await this.db.createAuditLog({
            userId:user.sub,
            organizationId:orgId,
            action:"invitation_accepted",
            resource:"organization",
            ipAddress:ip,
            userAgent
        })

        return {message:"Invitation accepted sucesfully.",membershipCreated}
    }
}
