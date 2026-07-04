import { Module } from '@nestjs/common';
import { DbService } from './db.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports:[PrismaModule],
  providers: [DbService],
  exports:[DbService]
})
export class DbModule {}
