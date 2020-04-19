import { Injectable } from '@nestjs/common';

import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { AbstractFileManagerService } from './abstract-file-manager.service';

@Injectable()
export class FsFileManagerService extends AbstractFileManagerService {
  async delete(fileName: string) {
    await new Promise((resolve, reject) => {
      fs.unlink(path.join(this.root, fileName), err => {
        if (err) {
          reject(err);
        }
        resolve(err);
      });
    });
  }

  resolveName(file: Express.Multer.File): string {
    return file.filename;
  }

  serveFile(res: Response, fileName: string) {
    res.sendFile(fileName, { root: this.root });
  }
}
