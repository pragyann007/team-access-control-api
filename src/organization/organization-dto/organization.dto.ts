import { IsString, IsOptional, IsInt, Min, IsEmail } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"

export class createOrganizationDTO {
    @ApiProperty({description:"Name of an Organization",example:"Zenera"})
    @IsString()
    name:string

    @ApiPropertyOptional({description:"Slug for an Organization",example:"zenera"})
    @IsOptional()
    @IsString()
    slug?:string
}

export class inviteUserDTO{
    @ApiProperty({description:"Email of user to invite",example:"member@gmail.com"})
    @IsEmail()
    email:string

    @ApiProperty({description:"Role to assign",example:"MEMBER"})
    @IsString()
    role:string
}

export class updateOrganizationDTO {
    @ApiPropertyOptional({description:"Name of an Organization",example:"Zenera Labs"})
    @IsOptional()
    @IsString()
    name?:string

    @ApiPropertyOptional({description:"Slug for an Organization",example:"zenera-labs"})
    @IsOptional()
    @IsString()
    slug?:string
}

export class updateMemberRoleDTO {
    @ApiProperty({description:"New role name",example:"ADMIN"})
    @IsString()
    role:string
}

export class auditLogsQueryDTO {
    @ApiPropertyOptional({description:"Page number",example:1})
    @IsOptional()
    @Type(()=>Number)
    @IsInt()
    @Min(1)
    page?:number

    @ApiPropertyOptional({description:"Items per page",example:20})
    @IsOptional()
    @Type(()=>Number)
    @IsInt()
    @Min(1)
    limit?:number
}
