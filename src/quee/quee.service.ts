import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class QueeService {

    constructor(@InjectQueue("mailQueue") private readonly mailQueue:Queue ){}

    async enqueeMail(data){
      const job =   await this.mailQueue.add("send-invitation-mail",data);
        console.log("jon added",job.id)

    }

}
