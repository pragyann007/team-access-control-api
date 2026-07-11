import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, Res, UseGuards } from '@nestjs/common';
import { createOrganizationDTO, inviteUserDTO } from './organization-dto/organization.dto';

import type  { Request,Response } from 'express';
import { OrganizationService } from './organization.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token/access-token.guard';
import { MembershipGuard } from 'src/auth/guards/membership/membership.guard';
import { PermissionGuard } from 'src/auth/guards/permission/permission.guard';
import { Permissions } from 'src/permissions/permissions.decorator';

@Controller('organization')
export class OrganizationController {

    constructor(
        private readonly organizationService:OrganizationService
    ){}


    @UseGuards(AccessTokenGuard)
    @Post("create")
    createOrganization(@Body() data:createOrganizationDTO ,
    @Req() req:Request,
    @Res({passthrough:true}) res:Response 
){
    
    return  this.organizationService.createOrganization(data,(req as any).user);


    }




    @Permissions("INVITE_MEMBER")
    @UseGuards(AccessTokenGuard,MembershipGuard,PermissionGuard)
    @Post(":id/invite")
    inviteUser(
        @Param("id",ParseIntPipe) id:number,
      
        @Req() req:Request,
        @Res({passthrough:true}) res:Response,
        @Body() data:inviteUserDTO ){

            const ip = req.ip;
            const userAgent = req.useragent;

        return this.organizationService.inviteMemerToOrganization(data,(req as any).user,id,ip,userAgent)

    }


    @UseGuards(AccessTokenGuard)
    @Get("/invite/accept/:inviteId")
    aceptInvitation(
        @Req() req:Request,
        @Param("inviteId") inviteId:string
    ){
        return this.organizationService.acceptInvitations(req,inviteId)

    }

}
