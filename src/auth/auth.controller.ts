import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {  LoginDTO, RegisterDTO } from './auth-dto/auth.dto';
import { AuthService } from './auth.service';
import type  {Request, Response } from 'express';
import { AccessTokenGuard } from './guards/access-token/access-token.guard';

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
    const userIp = req.ip ;
    const isMobile = req.useragent?.isMobile;
    const isDesktop = req.useragent?.isDesktop;
    const browser = req.useragent?.browser;
    const deviceType = isMobile && !isDesktop?"mobile" : "desktop"
    const payload = {
        userIp,
        browser,
        deviceType
    }

    const response = await this.authService.login(data,payload)

      res.cookie("refresh_token",response.refreshToken,{
                httpOnly:true,
                secure:false,
                maxAge:30*24*60*60*1000
            })



        return {
            message:response.message,
            accessToken:response.accessToken,
            sessions:response.createSession
        }
   }

  



   @ApiOperation({
    summary:"This controller performs token rotation task.",
    description:"This controller will executed or called by client when the accestoken inside client expires and it need to regenerate the access token with the help of refresh token"
   })
   @Post("refresh")
   async refresh(
     @Req() req: Request,
     @Res({passthrough:true}) res: Response,
   ) {
     console.log("1. Refresh endpoint hit");
   
     const { refresh_token } = req.cookies;
     console.log("2. Cookie:", refresh_token);
   
     const response = await this.authService.refresh(refresh_token);
   
     console.log("3. Service finished");
   
     res.cookie("refresh_token", response.refreshToken);
   
     return {
       message: response.message,
       accessToken: response.accessToken,
     };
   }
   


   @UseGuards(AccessTokenGuard)
   @Get("me")
   async getMe(@Req() req:Request ){
    return (req as any).user;

   }

}
