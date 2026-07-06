import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { createOrganizationDTO } from './organization-dto/organization.dto';

import type  { Request,Response } from 'express';
import { OrganizationService } from './organization.service';

@Controller('organization')
export class OrganizationController {

    constructor(
        private readonly organizationService:OrganizationService
    ){}



    @Post()
    createOrganization(@Body() data:createOrganizationDTO ,
    @Req() req:Request,
    @Res({passthrough:true}) res:Response 
){
    
    return  this.organizationService.createOrganization(data,(req as any).user);


    }
}
