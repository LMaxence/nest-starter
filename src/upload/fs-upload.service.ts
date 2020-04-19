import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import multer = require('multer');
import * as path from 'path';
import * as fs from 'fs';
import { TokenService } from 'src/helpers/token/token.service';
import { UploadOptions } from './interfaces';
import { Response } from 'express';

@Injectable()
export class FsUploadService {
  baseDir: string;
  options: MulterOptions;

  constructor(private configService: ConfigService, private tokenService: TokenService) {
    this.baseDir = this.configService.get('MULTER_DESTINATION_FOLDER');
    this.options = {
      dest: this.baseDir,
    };
  }

  generateStorage(options: MulterOptions) {
    const token = this.tokenService.generateToken;
    const finalOptions = {
      ...this.options,
      ...options,
    };
    return multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, finalOptions.dest);
      },
      filename: function(req, file, cb) {
        /*Appending extension with original name*/
        cb(null, token() + path.extname(file.originalname));
      },

      ...finalOptions,
    });
  }

  upload(fieldName: string, options: UploadOptions = {}, storageOptions: MulterOptions = {}) {
    return multer({
      storage: this.generateStorage(storageOptions),
    }).array(fieldName, options.maxCount);
  }

  async delete(fileName: string) {
    await new Promise((resolve, reject) => {
      fs.unlink(path.join(this.baseDir, fileName), err => {
        if (err) {
          reject(err);
        }
        resolve(err);
      });
    });
  }

  addFile(res: Response, fileName: string) {
    res.sendFile(fileName, { root: this.baseDir });
  }
}
