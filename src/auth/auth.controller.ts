import { Body, Controller, Get, HttpCode, HttpStatus, Post,  Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation,  ApiTags } from '@nestjs/swagger';
import {  forgotPasswordDTO, LoginDTO, RegisterDTO } from './auth-dto/auth.dto';
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
   @HttpCode(HttpStatus.CREATED)
   async registerUser(@Body() data:RegisterDTO){
    return this.authService.register(data);

   }

   @ApiOperation({
    summary:"Login Controller",
    description:"This logins the user and give acess token and refresh token "
   })
   @Post("login")
   @HttpCode(HttpStatus.OK)
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
   @HttpCode(HttpStatus.OK)
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
   




  @ApiOperation({
    summary:"Returns the current users data.",
    description:"Thisc controller is simpl protected by auth guard that inspects and check the token session availability and verifiesthe user on the basis of that."
  })   
   @UseGuards(AccessTokenGuard)
   @Get("me")
   @HttpCode(HttpStatus.OK)

   async getMe(@Req() req:Request ){
    return (req as any).user;

   }



   @ApiOperation({
    summary:"Logous the current user's device",
    description:"This controller simply takes ip and device info delete redis session for the device and delete cookie."
  })   
   @UseGuards(AccessTokenGuard)
   @Get("logout")
   @HttpCode(HttpStatus.OK)

   async logout(@Req() req:Request,@Res() res:Response
 ){
  const userIp = req.ip ;
  const isMobile = req.useragent?.isMobile;
  const isDesktop = req.useragent?.isDesktop;
  const browser = req.useragent?.browser;
  const deviceType = isMobile && !isDesktop?"mobile" : "desktop"
  
  res.clearCookie("refresh_token")

  return this.authService.logout((req as any).user,deviceType);
   }


}
