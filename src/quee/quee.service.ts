import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class QueeService {

    constructor(@InjectQueue("mailQueue") private readonly mailQueue:Queue ){}

    async enqueeMail(data){
        await this.mailQueue.add("send-invitation-mail",data);

    }

}
