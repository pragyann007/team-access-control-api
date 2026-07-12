import { ApiProperty } from "@nestjs/swagger"
import { IsEmail,IsString, IsNumberString, IsOptional } from "class-validator"

export class RegisterDTO {
    @ApiProperty({description:"Name of user",example:"Pragayan"})
    @IsString()
    name:string

    @ApiProperty({description:"Email of user",example:"pragyan@gmail.com"})
    @IsEmail()
    email:string

    @ApiProperty({description:"Password of user's account.",example:"xyz@13abc%6*"})
    @IsString()
    password:string
}

export class LoginDTO {
    @ApiProperty({description:"Email of user",example:"pragyan@gmail.com"})
    @IsEmail()
    email:string

    @ApiProperty({description:"Password of user's account.",example:"xyz@13abc%6*"})
    @IsString()
    password:string
}

export class forgotPasswordDTO {
    @ApiProperty({description:"Email of user",example:"pragyan@gmail.com"})
    @IsEmail()
    email:string
}

export class verifyOtpDTO {
    @ApiProperty({description:"Email of user",example:"pragyan@gmail.com"})
    @IsEmail()
    email:string

    @ApiProperty({description:"OTP received via email",example:"12345678"})
    @IsString()
    otp:string
}

export class resetPasswordDTO {
    @ApiProperty({description:"Email of user",example:"pragyan@gmail.com"})
    @IsEmail()
    email:string

    @ApiProperty({description:"New Password",example:"xyz@13abc%6*"})
    @IsString()
    newPassword:string
}

export class changePasswordDTO {
    @ApiProperty({description:"Email of user",example:"pragyan@gmail.com"})
    @IsEmail()
    email:string

    @ApiProperty({description:"Old Password",example:"oldpass123"})
    @IsString()
    oldPassword:string

    @ApiProperty({description:"New Password",example:"xyz@13abc%6*"})
    @IsString()
    newPassword:string
}
