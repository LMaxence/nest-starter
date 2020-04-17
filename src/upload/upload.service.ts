import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import multer = require('multer');
import * as path from 'path';

export interface UploadOptions {
  maxCount?: number;
}

@Injectable()
export class UploadService {
  generateStorage: (options: MulterOptions) => any;
  constructor(private configService: ConfigService) {
    switch (process.env.NODE_ENV) {
      default:
        this.generateStorage = (options: MulterOptions) =>
          multer.diskStorage({
            destination: function(req, file, cb) {
              cb(null, options.dest || 'upload/');
            },
            filename: function(req, file, cb) {
              /*Appending extension with original name*/
              cb(null, file.originalname + path.extname(file.originalname));
            },
            ...options,
          });
    }
  }

  get options(): MulterOptions {
    switch (process.env.NODE_ENV) {
      default:
        return {
          dest: this.configService.get('MULTER_DESTINATION_FOLDER'),
        };
    }
  }

  upload(fieldName: string, options: UploadOptions = {}, storageOptions: MulterOptions = {}) {
    return multer({
      storage: this.generateStorage(storageOptions),
    }).array(fieldName, options.maxCount);
  }
}
