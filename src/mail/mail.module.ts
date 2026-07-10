import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { BullModule } from '@nestjs/bullmq';
import { MailProcessor } from 'src/mail/quee.processor';
import { QueeModule } from 'src/quee/quee.module';

@Module({
  imports:[
    BullModule.registerQueue({
      name:"emailQuee"
    })
  ],
  providers: [MailService,MailProcessor],
  exports:[MailService]
})

export class MailModule {}

