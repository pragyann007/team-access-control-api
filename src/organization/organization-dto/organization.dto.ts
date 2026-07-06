import { IsString } from "class-validator"
import {} from "class-transformer"

export class createOrganizationDTO {
    @IsString()
    name:string


    @IsString()
    slug:string

}