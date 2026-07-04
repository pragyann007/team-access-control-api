import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {  LoginDTO, RegisterDTO } from './auth-dto/auth.dto';
import { AuthService } from './auth.service';
import type  {Request, Response } from 'express';

@ApiTags("Authentication")
@Controller('auth')
export class AuthController {

    constructor(private readonly authService:AuthService
    ){
    }
 
   @ApiOperation({summary:"Register Controller",description:"This register the users"})
   @Post("/register")
   async registerUser(@Body() data:RegisterDTO){
    return this.authService.register(data);

   }

   @ApiOperation({
    summary:"Login Controller",
    description:"This logins the user and give acess token and refresh token "
   })
   @Post("login")
   async loginUser(
    @Body() data:LoginDTO,
    @Req () req:Request,
    @Res({passthrough:true}) res:Response

){
    return this.authService.login(req,res,data)
   }
   

}
