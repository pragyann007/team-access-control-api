import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import {Queue} from "bullmq"
import nodemailer, { Transporter } from "nodemailer"

@Injectable()
export class MailService {
    private transporter:Transporter
    constructor(
        @InjectQueue("emailQuee") private readonly emailQuee:Queue,
    ){
        this.transporter =nodemailer.createTransport({
            host:"smtp.com",
            port:"",
            auth:{
                user:"",
                pass:""
            }
        })

    }

    async sendInviteMail(){
        this.transporter.sendMail({
            subject:"",
            html:`<p>Hey</p>`
        })

    }

 
}
