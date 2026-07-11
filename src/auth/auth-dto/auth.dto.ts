import { ApiProperty } from "@nestjs/swagger"
import {} from "class-transformer"
import { IsEmail,IsString } from "class-validator"

export class RegisterDTO {
    @ApiProperty({
        description:"Name of user",
        example:"Pragayan",
    })
    @IsString()
    name:string


    @ApiProperty({
        description:"Enail of user",
        example:"pragyan@gmail.com",
    })
    @IsEmail()
    email:string


    @ApiProperty({
        description:"Password of user's account.",
        example:"xyz@13abc%6*",
    })
    @IsString()
    password:string



}

export class LoginDTO {

    @ApiProperty({
        description:"Enail of user",
        example:"pragyan@gmail.com",
    })
    @IsEmail()
    email:string


    @ApiProperty({
        description:"Password of user's account.",
        example:"xyz@13abc%6*",
    })
    @IsString()
    password:string

}