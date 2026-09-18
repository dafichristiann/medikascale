import { Module } from '@nestjs/common';
import { ArsipStubController } from './arsip.controller';
import { ResepStubController } from './resep.controller';
import { LabStubController } from './lab.controller';

@Module({
  controllers: [ArsipStubController, ResepStubController, LabStubController],
})
export class StubsModule {}
