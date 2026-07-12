import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { jobName } from 'src/constants/jobName';

@Injectable()
export class QueeService {

    constructor(@InjectQueue("mailQueue") private readonly mailQueue:Queue ){}

    async enqueeMail(data){
      const job = await this.mailQueue.add(jobName.invite,data);
      return job;
    }

    async enqueeForgotMail(data){
        const job = await this.mailQueue.add(jobName.forgot,data);
        return job;
    }
}
