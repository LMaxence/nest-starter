import { Module } from '@nestjs/common';
import { FsFileManagerService } from './fs-file-manager.service';
import { ConfigModule } from 'src/config/config.module';
import { HelpersModule } from 'src/helpers/helpers.module';
import { FileService } from './upload-manager.service';
import { StorageService } from './storage/storage.service';

@Module({
  imports: [ConfigModule, HelpersModule],
  providers: [FsFileManagerService, StorageService, FileService],
  exports: [FileService, StorageService],
})
export class UploadModule {}
