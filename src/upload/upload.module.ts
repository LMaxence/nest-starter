import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
