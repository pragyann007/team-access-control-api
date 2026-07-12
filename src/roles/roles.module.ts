import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { DbModule } from 'src/db/db.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[DbModule, JwtModule.register({})],
  controllers: [RolesController],
})
export class RolesModule {}
