import { IsString } from "class-validator"
import {} from "class-transformer"
import { ApiProperty } from "@nestjs/swagger"

export class createOrganizationDTO {

    @ApiProperty({
        description:"Name of an Organization",
        example:"Zenera"
    })
    @IsString()
    name:string


    @ApiProperty({
        description:"Slug for an Organization",
        example:"/zenera"
    })
    @IsString()
    slug:string

}


export class inviteUserDTO{
    @IsString()
    email:string
}