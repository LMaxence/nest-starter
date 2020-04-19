import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { FILE_MANAGERS } from './upload.constants';

import { Response } from 'express';
import { AbstractFileManagerService } from './file-managers/abstract-file-manager.service';
import { FsFileManagerService } from './file-managers/fs-file-manager.service';

@Injectable()
export class FileService {
  private uploadService: AbstractFileManagerService;
  constructor(private configService: ConfigService) {
    const managerType = configService.get('FILE_MANAGER');
    if (managerType === FILE_MANAGERS.fs) {
      this.uploadService = new FsFileManagerService(configService);
    } else {
      console.warn('FILE_MANAGER env variable is not defined -> defaults to file system manager');
      this.uploadService = new FsFileManagerService(configService);
    }
  }

  delete(fileName: string) {
    return this.uploadService.delete(fileName);
  }

  serveFile(res: Response, fileName: string) {
    return this.uploadService.serveFile(res, fileName);
  }
}
