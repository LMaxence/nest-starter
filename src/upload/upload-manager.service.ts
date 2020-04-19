import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { FILE_MANAGERS } from './upload.constants';

import { Response } from 'express';
import { AbstractFileManagerService } from './file-managers/abstract-file-manager.service';
import { FsFileManagerService } from './file-managers/fs-file-manager.service';
import { S3FileManagerService } from './file-managers/s3-file-manager.service';

@Injectable()
export class FileService {
  private uploadService: AbstractFileManagerService;
  constructor(private configService: ConfigService) {
    const managerType = configService.get('FILE_MANAGER');
    if (managerType === FILE_MANAGERS.fs) {
      this.uploadService = new FsFileManagerService(configService);
    } else if (managerType === FILE_MANAGERS.s3) {
      this.uploadService = new S3FileManagerService(configService);
    } else {
      console.warn('FILE_MANAGER env variable is not defined -> defaults to file system manager');
      this.uploadService = new FsFileManagerService(configService);
    }
  }

  delete(fileName: string) {
    return this.uploadService.delete(fileName);
  }

  resolveName(file: Express.Multer.File) {
    return this.uploadService.resolveName(file);
  }

  serveFile(res: Response, fileName: string) {
    return this.uploadService.serveFile(res, fileName);
  }
}
