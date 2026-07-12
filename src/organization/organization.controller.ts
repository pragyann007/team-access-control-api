import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { auditLogsQueryDTO, createOrganizationDTO, inviteUserDTO, updateMemberRoleDTO, updateOrganizationDTO } from './organization-dto/organization.dto';
import type { Request } from 'express';
import { OrganizationService } from './organization.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token/access-token.guard';
import { MembershipGuard } from 'src/auth/guards/membership/membership.guard';
import { PermissionGuard } from 'src/auth/guards/permission/permission.guard';
import { Permissions } from 'src/permissions/permissions.decorator';

@ApiTags("Organization")
@ApiBearerAuth()
@Controller('organization')
export class OrganizationController {

    constructor(
        private readonly organizationService:OrganizationService
    ){}

    @ApiOperation({summary:"Create Organization",description:"Creates a new organization and assigns OWNER role to creator"})
    @UseGuards(AccessTokenGuard)
    @Post("create")
    createOrganization(@Body() data:createOrganizationDTO ,@Req() req:Request){
        return this.organizationService.createOrganization(data,(req as any).user);
    }

    @ApiOperation({summary:"Accept Invitation",description:"Accepts organization invitation using invite token"})
    @UseGuards(AccessTokenGuard)
    @Get("invite/accept")
    aceptInvitation(
        @Req() req:Request,
        @Query("token") token:string
    ){
        if(!token) throw new BadRequestException("Invitation token is required")
        return this.organizationService.acceptInvitations(req,token,req.ip ?? "",req.useragent?.source ?? "")
    }

    @ApiOperation({summary:"Get Organization",description:"Returns organization details"})
    @Permissions("VIEW_ORGANIZATION")
    @UseGuards(AccessTokenGuard,MembershipGuard,PermissionGuard)
    @Get(":id")
    getOrganization(@Param("id",ParseIntPipe) id:number){
        return this.organizationService.getOrganization(id);
    }

    @ApiOperation({summary:"Update Organization",description:"Updates organization name or slug"})
    @Permissions("UPDATE_ORGANIZATION")
    @UseGuards(AccessTokenGuard,MembershipGuard,PermissionGuard)
    @Patch(":id")
    updateOrganization(@Param("id",ParseIntPipe) id:number,@Body() data:updateOrganizationDTO){
        return this.organizationService.updateOrganization(id,data);
    }

    @ApiOperation({summary:"Delete Organization",description:"Deletes organization and related data"})
    @Permissions("DELETE_ORGANIZATION")
    @UseGuards(AccessTokenGuard,MembershipGuard,PermissionGuard)
    @Delete(":id")
    deleteOrganization(@Param("id",ParseIntPipe) id:number){
        return this.organizationService.deleteOrganization(id);
    }

    @ApiOperation({summary:"List Members",description:"Returns all members of an organization"})
    @Permissions("VIEW_MEMBERS")
    @UseGuards(AccessTokenGuard,MembershipGuard,PermissionGuard)
    @Get(":id/members")
    getMembers(@Param("id",ParseIntPipe) id:number){
        return this.organizationService.getMembers(id);
    }

    @ApiOperation({summary:"Remove Member",description:"Removes a member from organization"})
    @Permissions("REMOVE_MEMBER")
    @UseGuards(AccessTokenGuard,MembershipGuard,PermissionGuard)
    @Delete(":id/members/:userId")
    removeMember(
        @Param("id",ParseIntPipe) id:number,
        @Param("userId",ParseIntPipe) userId:number,
        @Req() req:Request
    ){
        return this.organizationService.removeMember(id,userId,(req as any).user.sub,req.ip ?? "",req.useragent?.source ?? "");
    }

    @ApiOperation({summary:"Update Member Role",description:"Changes a member's role in organization"})
    @Permissions("UPDATE_MEMBER_ROLE")
    @UseGuards(AccessTokenGuard,MembershipGuard,PermissionGuard)
    @Patch(":id/members/:userId/role")
    updateMemberRole(
        @Param("id",ParseIntPipe) id:number,
        @Param("userId",ParseIntPipe) userId:number,
        @Body() data:updateMemberRoleDTO,
        @Req() req:Request
    ){
        return this.organizationService.updateMemberRole(id,userId,data.role,(req as any).user.sub,req.ip ?? "",req.useragent?.source ?? "");
    }

    @ApiOperation({summary:"Invite Member",description:"Sends invitation email to join organization"})
    @Permissions("INVITE_MEMBER")
    @UseGuards(AccessTokenGuard,MembershipGuard,PermissionGuard)
    @Post(":id/invite")
    inviteUser(
        @Param("id",ParseIntPipe) id:number,
        @Req() req:Request,
        @Body() data:inviteUserDTO ){
        return this.organizationService.inviteMemerToOrganization(data,(req as any).user,id,req.ip ?? "",req.useragent?.source ?? "")
    }

    @ApiOperation({summary:"List Pending Invitations",description:"Returns pending invitations for organization"})
    @Permissions("VIEW_MEMBERS")
    @UseGuards(AccessTokenGuard,MembershipGuard,PermissionGuard)
    @Get(":id/invitations")
    getInvitations(@Param("id",ParseIntPipe) id:number){
        return this.organizationService.getInvitations(id);
    }

    @ApiOperation({summary:"Revoke Invitation",description:"Revokes a pending invitation"})
    @Permissions("INVITE_MEMBER")
    @UseGuards(AccessTokenGuard,MembershipGuard,PermissionGuard)
    @Delete(":id/invitations/:inviteId")
    revokeInvitation(
        @Param("id",ParseIntPipe) id:number,
        @Param("inviteId",ParseIntPipe) inviteId:number
    ){
        return this.organizationService.revokeInvitation(id,inviteId);
    }

    @ApiOperation({summary:"Audit Logs",description:"Returns paginated audit logs for organization"})
    @Permissions("VIEW_AUDIT_LOGS")
    @UseGuards(AccessTokenGuard,MembershipGuard,PermissionGuard)
    @Get(":id/audit-logs")
    getAuditLogs(
        @Param("id",ParseIntPipe) id:number,
        @Query() query:auditLogsQueryDTO
    ){
        return this.organizationService.getAuditLogs(id,query.page ?? 1,query.limit ?? 20);
    }
}
