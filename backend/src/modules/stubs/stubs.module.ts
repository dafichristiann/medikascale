import { Module } from '@nestjs/common';
import { ResepStubController } from './resep.controller';
import { LabStubController } from './lab.controller';

@Module({
  controllers: [ResepStubController, LabStubController],
})
export class StubsModule {}
