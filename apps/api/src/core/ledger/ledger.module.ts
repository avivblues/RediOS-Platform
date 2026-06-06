import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { LedgerEngine } from './ledger-engine.service';

@Module({
  imports: [MetadataModule],
  providers: [LedgerEngine],
  exports: [LedgerEngine],
})
export class LedgerModule {}
