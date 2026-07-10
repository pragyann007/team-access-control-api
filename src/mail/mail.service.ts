import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {Queue} from "bullmq"
import nodemailer, { Transporter } from "nodemailer"

@Injectable()
export class MailService {
    private transporter:Transporter
    constructor(
      
        private readonly configService:ConfigService
    ){
        this.transporter =nodemailer.createTransport({
            host:"smtp.gmail.com",
            port:587,
            secure:false,
            auth:{
                user:this.configService.get<string>("SMTP_USER"),
                pass:this.configService.get<string>("SMTP_PASSWORD")
            }
           
        })

    }

    async sendInviteMail(data){
        // data contains ={
        //    const mailDataPayload = {
        //     to:data.email,
        //     inviteLink
        // }

        console.log('ijustraned',data)
        
    // }
      try {
        await this.transporter.verify();

        console.log("SMTP connection successful");


         const result =  await this.transporter.sendMail({
            from:this.configService.get<string>("SMTP_USER"),
            to:data.to,
            subject:"Invitation to {data.name} organization",
            html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Organization Invitation in ${data.orgName}</title>
</head>

<body style="
    margin:0;
    padding:0;
    background:#050505;
    font-family:Arial, Helvetica, sans-serif;
    color:#ffffff;
">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 0;">
<tr>
<td align="center">

<table width="600px" cellpadding="0" cellspacing="0" style="
    background:#111111;
    border:1px solid #262626;
    border-radius:16px;
    overflow:hidden;
">

<!-- Header -->
<tr>
<td style="
    padding:35px;
    text-align:center;
    background:linear-gradient(135deg,#171717,#090909);
">

<h1 style="
    margin:0;
    font-size:28px;
    color:#ffffff;
">
    You're Invited 🚀
</h1>

<p style="
    margin-top:12px;
    color:#a3a3a3;
    font-size:15px;
">
    Join your team and start collaborating
</p>

</td>
</tr>


<!-- Body -->
<tr>
<td style="
    padding:35px;
">

<p style="
    font-size:16px;
    color:#e5e5e5;
">
Hello,
</p>


<p style="
    font-size:16px;
    line-height:1.6;
    color:#bdbdbd;
">

You have been invited to join

<strong style="color:#ffffff;">
${data.name}
</strong>

organization.

Click the button below to accept your invitation and become part of the team.

</p>


<div style="
    text-align:center;
    margin:35px 0;
">

<a href="${data.inviteLink}" 
style="
    display:inline-block;
    padding:15px 32px;
    background:#ffffff;
    color:#000000;
    text-decoration:none;
    border-radius:10px;
    font-weight:bold;
    font-size:15px;
">
Accept Invitation
</a>

</div>


<p style="
font-size:13px;
color:#737373;
line-height:1.5;
">

If the button does not work, copy and paste this link into your browser:

</p>


<p style="
background:#0a0a0a;
padding:15px;
border-radius:8px;
border:1px solid #262626;
word-break:break-all;
font-size:12px;
color:#a3a3a3;
">
${data.inviteLink}
</p>


</td>
</tr>


<!-- Footer -->

<tr>
<td style="
padding:25px;
text-align:center;
background:#090909;
border-top:1px solid #262626;
">

<p style="
margin:0;
font-size:13px;
color:#737373;
">
This invitation was sent automatically. Please do not reply.
</p>


<p style="
margin-top:10px;
font-size:12px;
color:#525252;
">
© ${new Date().getFullYear()} Your Company
</p>


</td>
</tr>


</table>

</td>
</tr>
</table>

</body>
</html>
`


              
          })
          console.log(result)
          console.log('mail sent sucess')
      } catch (error) {
        console.log("error sending mail",error)
        throw new InternalServerErrorException("Internal server error")
        
      }

    }

 
}
