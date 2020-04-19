import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { FILE_MANAGERS } from '../upload.constants';
import * as multer from 'multer';
import { TokenService } from 'src/helpers/token/token.service';
import * as path from 'path';
import { StorageOptions } from '../interfaces';

@Injectable()
export class StorageService {
  storageType: FILE_MANAGERS;
  root: string;
  constructor(private configService: ConfigService, private tokenService: TokenService) {
    this.root = this.configService.get('FILE_STORAGE_ROOT');
    this.storageType = configService.get('FILE_MANAGER') as FILE_MANAGERS;
  }

  getStorage(options?: StorageOptions): multer.StorageEngine {
    const createToken = this.tokenService.generateToken;
    const destination = (options && options.destination) || this.root;
    const filename =
      (options && options.filename) ||
      function(req, file, cb) {
        /*Appending extension with original name*/
        cb(null, createToken() + path.extname(file.originalname));
      };
    switch (this.storageType) {
      case FILE_MANAGERS.fs:
        return multer.diskStorage({ destination, filename });
      default:
        console.warn('No FILE_MANAGER env variable found -> defaults to FileStorage');
        return multer.diskStorage({ destination, filename });
    }
  }
}
