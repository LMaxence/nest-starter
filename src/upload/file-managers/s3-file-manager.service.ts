import { Injectable } from '@nestjs/common';

import { Response } from 'express';
import { AbstractFileManagerService } from './abstract-file-manager.service';

@Injectable()
export class S3FileManagerService extends AbstractFileManagerService {
  async delete(fileName: string) {}

  resolveName(file: Express.MulterS3.File): string {
    return file.key;
  }

  serveFile(res: Response, fileName: string) {
    res.sendFile(fileName, { root: this.root });
  }
}
