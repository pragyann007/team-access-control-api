import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { changePasswordDTO, forgotPasswordDTO, LoginDTO, RegisterDTO, resetPasswordDTO, verifyOtpDTO } from './auth-dto/auth.dto';
import { AuthService } from './auth.service';
import type {Request, Response } from 'express';
import { AccessTokenGuard } from './guards/access-token/access-token.guard';

@ApiTags("Authentication")
@Controller('auth')
export class AuthController {

    constructor(private readonly authService:AuthService){}
 
   @ApiOperation({summary:"Register Controller",description:"This register the users"})
   @Post("/register")
   @HttpCode(HttpStatus.CREATED)
   async registerUser(@Body() data:RegisterDTO){
    return this.authService.register(data);
   }

   @ApiOperation({summary:"Login Controller",description:"This logins the user and give acess token and refresh token"})
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
    const payload = {userIp,browser,deviceType}

    const response = await this.authService.login(data,payload)

    res.cookie("refresh_token",response.refreshToken,this.authService.getCookieOptions())

    return {
        message:response.message,
        accessToken:response.accessToken,
        sessions:response.createSession
    }
   }

   @ApiOperation({summary:"Token rotation",description:"Regenerate access token using refresh token cookie"})
   @Post("refresh")
   @HttpCode(HttpStatus.OK)
   async refresh(
     @Req() req: Request,
     @Res({passthrough:true}) res: Response,
   ) {
     const { refresh_token } = req.cookies;
     const response = await this.authService.refresh(refresh_token);
     res.cookie("refresh_token", response.refreshToken, this.authService.getCookieOptions());
     return {
       message: response.message,
       accessToken: response.accessToken,
     };
   }

  @ApiBearerAuth()
  @ApiOperation({summary:"Returns the current users data."})
   @UseGuards(AccessTokenGuard)
   @Get("me")
   @HttpCode(HttpStatus.OK)
   async getMe(@Req() req:Request ){
    return (req as any).user;
   }

  @ApiBearerAuth()
  @ApiOperation({summary:"Logout current device"})
   @UseGuards(AccessTokenGuard)
   @Get("logout")
   @HttpCode(HttpStatus.OK)
   async logout(@Req() req:Request,@Res({passthrough:true}) res:Response){
    const isMobile = req.useragent?.isMobile;
    const isDesktop = req.useragent?.isDesktop;
    const deviceType = isMobile && !isDesktop?"mobile" : "desktop"
    res.clearCookie("refresh_token")
    return this.authService.logout((req as any).user,deviceType);
   }

  @ApiBearerAuth()
  @ApiOperation({summary:"Logout all devices"})
   @UseGuards(AccessTokenGuard)
   @Post("logout-all")
   @HttpCode(HttpStatus.OK)
   async logoutAll(@Req() req:Request,@Res({passthrough:true}) res:Response){
    res.clearCookie("refresh_token")
    return this.authService.logoutAll((req as any).user);
   }

  @ApiBearerAuth()
  @ApiOperation({summary:"List active sessions"})
   @UseGuards(AccessTokenGuard)
   @Get("sessions")
   @HttpCode(HttpStatus.OK)
   async getSessions(@Req() req:Request){
    return this.authService.getSessions((req as any).user.sub);
   }

  @ApiBearerAuth()
  @ApiOperation({summary:"Revoke a specific session"})
   @UseGuards(AccessTokenGuard)
   @Delete("sessions/:id")
   @HttpCode(HttpStatus.OK)
   async revokeSession(@Req() req:Request,@Param("id",ParseIntPipe) id:number){
    return this.authService.revokeSession((req as any).user.sub,id);
   }

   @ApiOperation({summary:"Generate OTP for forgot password"})
   @Post("forgot-password")
   @HttpCode(HttpStatus.OK)
   async forgotPassword(@Body() data:forgotPasswordDTO){
    return this.authService.generateOtp(data);
   }

   @ApiOperation({summary:"Verify OTP"})
   @Post("verify-otp")
   @HttpCode(HttpStatus.OK)
   async verifyOtp(@Body() data:verifyOtpDTO){
    return this.authService.verifyOtp(data);
   }

   @ApiOperation({summary:"Reset password after OTP verification"})
   @Post("reset-password")
   @HttpCode(HttpStatus.OK)
   async resetPassword(@Body() data:resetPasswordDTO){
    return this.authService.forgotPasswordResetWithOtp(data);
   }

   @ApiOperation({summary:"Change password with old password"})
   @Post("change-password")
   @HttpCode(HttpStatus.OK)
   async changePassword(@Body() data:changePasswordDTO){
    return this.authService.forgotPasswordResetWithPassword(data);
   }
}
