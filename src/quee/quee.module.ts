import { Module } from '@nestjs/common';
import { QueeService } from './quee.service';
import { BullModule } from '@nestjs/bullmq';


@Module({
    imports:[
        BullModule.registerQueue({
            name:"mailQueue"
            
        })
    ],
  providers: [QueeService]
})
export class QueeModule {}
