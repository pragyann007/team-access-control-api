import { Module } from '@nestjs/common';
import { QueeService } from './quee.service';
import { BullModule } from '@nestjs/bullmq';
import { MailProcessor } from '../mail/quee.processor';
import { MailModule } from 'src/mail/mail.module';


@Module({
    imports:[
        MailModule,
        BullModule.registerQueue({
            name:"mailQueue"
            
        })
    ],
  providers: [QueeService,MailProcessor],
  exports:[QueeService,MailProcessor]
})
export class QueeModule {}
