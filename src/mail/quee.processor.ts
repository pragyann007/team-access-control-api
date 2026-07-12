import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { jobName } from 'src/constants/jobName';
import { MailService } from 'src/mail/mail.service';

@Processor('mailQueue')
export class MailProcessor extends WorkerHost {

  private readonly logger = new Logger(MailProcessor.name);

  constructor(
    private readonly mailService: MailService
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}...`);

    switch (job.name) {
      case jobName.invite:
        await this.mailService.sendInviteMail(job.data);
        this.logger.log(`Invite email sent successfully`);
        break;

      case jobName.forgot:
        await this.mailService.sendForgotPasswordMail(job.data);
        this.logger.log(`Forgot password email sent successfully`);
        break;

      default:
        throw new Error(`Unknown job name/type: ${job.name}`);
    }
  }
}
