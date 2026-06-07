import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MetadataModule } from '../metadata/metadata.module';
import { StorageModule } from '../storage/storage.module';
import { ConflictEngine } from './conflict-engine.service';
import { SYNC_CONFLICT_MODEL, SyncConflictSchema } from './schemas/sync-conflict.schema';

@Module({
  imports: [
    MetadataModule,
    StorageModule,
    MongooseModule.forFeature([
      {
        name: SYNC_CONFLICT_MODEL,
        schema: SyncConflictSchema,
      },
    ]),
  ],
  providers: [ConflictEngine],
  exports: [ConflictEngine],
})
export class ConflictModule {}
