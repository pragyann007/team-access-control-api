import { Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

@Controller('user')
export class UserController {

    @ApiOperation({})
    @Post()
    createOrganisations(){
        
    }


}
