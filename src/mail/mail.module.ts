import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports:[
    BullModule.registerQueue({
      name:"mailQueue"
    })
  ],
  providers: [MailService],
  exports:[MailService]
})

export class MailModule {}
