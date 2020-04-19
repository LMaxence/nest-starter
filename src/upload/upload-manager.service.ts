import { AbstractUploadService } from './abstract-upload.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { FILE_MANAGERS } from './upload.constants';
import { FsUploadService } from './fs-upload.service';
import { TokenService } from 'src/helpers/token/token.service';
import { UploadOptions } from './interfaces';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Response } from 'express';

@Injectable()
export class UploadManagerService {
  private uploadService: AbstractUploadService<UploadOptions>;
  constructor(private configService: ConfigService, private tokenService: TokenService) {
    const managerType = configService.get('FILE_MANAGER');
    switch (managerType) {
      case FILE_MANAGERS.fs:
        this.uploadService = new FsUploadService(configService, tokenService);
      default:
        this.uploadService = new FsUploadService(configService, tokenService);
    }
  }

  upload(fieldName: string, options: UploadOptions = {}, storageOptions: MulterOptions = {}) {
    return this.uploadService.upload(fieldName, options, storageOptions);
  }

  delete(fileName: string) {
    return this.uploadService.delete(fileName);
  }

  addFile(res: Response, fileName: string) {
    return this.uploadService.addFile(res, fileName);
  }
}
