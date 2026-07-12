import { IsEmail, IsOptional, IsString } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"

export class updateUserDTO {
    @ApiPropertyOptional({description:"Name of user",example:"Pragayan"})
    @IsOptional()
    @IsString()
    name?:string

    @ApiPropertyOptional({description:"Email of user",example:"pragyan@gmail.com"})
    @IsOptional()
    @IsEmail()
    email?:string
}
