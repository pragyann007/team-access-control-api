import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token/access-token.guard';
import { DbService } from 'src/db/db.service';

@ApiTags("Roles")
@ApiBearerAuth()
@Controller('roles')
export class RolesController {

    constructor(private readonly db:DbService){}

    @ApiOperation({summary:"List all roles"})
    @UseGuards(AccessTokenGuard)
    @Get()
    getRoles(){
        return this.db.findAllRoles();
    }

    @ApiOperation({summary:"List permissions for a role"})
    @UseGuards(AccessTokenGuard)
    @Get(":id/permissions")
    getRolePermissions(@Param("id",ParseIntPipe) id:number){
        return this.db.findRolePermissions(id);
    }
}
