import { Module } from '@nestjs/common';
import { FsFileManagerService } from './file-managers/fs-file-manager.service';
import { ConfigModule } from 'src/config/config.module';
import { HelpersModule } from 'src/helpers/helpers.module';
import { FileService } from './upload-manager.service';
import { StorageService } from './storage/storage.service';
import { MsFileManagerService } from './file-managers/ms-file-manager.service';

@Module({
  imports: [ConfigModule, HelpersModule],
  providers: [FsFileManagerService, StorageService, FileService, MsFileManagerService],
  exports: [FileService, StorageService],
})
export class UploadModule {}
