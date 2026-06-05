import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongodbStorageProvider } from './providers/mongodb-storage.provider';
import { RUNTIME_DOCUMENT_MODEL, RuntimeDocumentSchema } from './schemas/runtime-document.schema';
import { StorageEngine } from './storage.engine';
import { STORAGE_PROVIDER } from './storage-provider.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RUNTIME_DOCUMENT_MODEL,
        schema: RuntimeDocumentSchema,
      },
    ]),
  ],
  providers: [
    MongodbStorageProvider,
    {
      provide: STORAGE_PROVIDER,
      useExisting: MongodbStorageProvider,
    },
    StorageEngine,
  ],
  exports: [StorageEngine, STORAGE_PROVIDER],
})
export class StorageModule {}
