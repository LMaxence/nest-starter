import { Module } from '@nestjs/common';
import { FsUploadService } from './fs-upload.service';
import { ConfigModule } from 'src/config/config.module';
import { HelpersModule } from 'src/helpers/helpers.module';

@Module({
  imports: [ConfigModule, HelpersModule],
  providers: [FsUploadService],
  exports: [FsUploadService],
})
export class UploadModule {}
