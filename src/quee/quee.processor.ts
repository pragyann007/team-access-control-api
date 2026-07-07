import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { jobName } from 'src/constants/jobName';

@Processor('mailQueue')
export class mailProcessor extends WorkerHost {
  private readonly logger = new Logger(mailProcessor.name);


  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}...`);

    switch (job.name) {
      case jobName.invite:
        

        

      default:
        throw new Error(`Unknown job name/type: ${job.name}`);
    }
  }
}
