import { Module } from '@nestjs/common';
import { FsUploadService } from './fs-upload.service';
import { ConfigModule } from 'src/config/config.module';
import { HelpersModule } from 'src/helpers/helpers.module';
import { UploadManagerService } from './upload-manager.service';

@Module({
  imports: [ConfigModule, HelpersModule],
  providers: [FsUploadService, UploadManagerService],
  exports: [FsUploadService, UploadManagerService],
})
export class UploadModule {}
