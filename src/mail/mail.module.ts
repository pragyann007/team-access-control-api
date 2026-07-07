import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports:[
    BullModule.registerQueue({
      name:"emailQuee"
    })
  ],
  providers: [MailService]
})
export class MailModule {}
