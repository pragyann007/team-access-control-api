import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token/access-token.guard';
import { UserService } from './user.service';
import type { Request } from 'express';
import { updateUserDTO } from './user-dto/user.dto';

@ApiTags("Users")
@ApiBearerAuth()
@Controller('users')
export class UserController {

    constructor(private readonly userService:UserService){}

    @ApiOperation({summary:"Get current user profile"})
    @UseGuards(AccessTokenGuard)
    @Get("me")
    getMe(@Req() req:Request){
        return this.userService.getMe((req as any).user.sub);
    }

    @ApiOperation({summary:"Update current user profile"})
    @UseGuards(AccessTokenGuard)
    @Patch("me")
    updateMe(@Req() req:Request,@Body() data:updateUserDTO){
        return this.userService.updateMe((req as any).user.sub,data);
    }

    @ApiOperation({summary:"List organizations for current user"})
    @UseGuards(AccessTokenGuard)
    @Get("me/organizations")
    getMyOrganizations(@Req() req:Request){
        return this.userService.getMyOrganizations((req as any).user.sub);
    }
}
