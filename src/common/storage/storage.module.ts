import { Module } from '@nestjs/common';
import { LocalStorageService } from './local-storage.service';
import { STORAGE_PROVIDER } from './storage.provider';

@Module({
  providers: [
    LocalStorageService,
    {
      provide: STORAGE_PROVIDER,
      useExisting: LocalStorageService,
    },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
