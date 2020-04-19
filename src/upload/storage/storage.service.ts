import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { FILE_MANAGERS } from '../upload.constants';
import * as multer from 'multer';
import { TokenService } from 'src/helpers/token/token.service';
import * as path from 'path';
import { StorageOptions, S3Options } from '../interfaces';
import { S3 } from 'aws-sdk';
import * as multerS3 from 'multer-s3';

@Injectable()
export class StorageService {
  storageType: FILE_MANAGERS;
  root: string;
  constructor(private configService: ConfigService, private tokenService: TokenService) {
    this.root = this.configService.get('FILE_STORAGE_ROOT');
    this.storageType = configService.get('FILE_MANAGER') as FILE_MANAGERS;
  }

  private _getFilesystemStorage(options?: multer.DiskStorageOptions): multer.StorageEngine {
    const createToken = this.tokenService.generateToken;
    const destination = (options && options.destination) || this.root;
    const filename =
      (options && options.filename) ||
      function(req, file, cb) {
        /*Appending extension with original name*/
        cb(null, createToken() + path.extname(file.originalname));
      };
    return multer.diskStorage({ destination, filename });
  }

  private _getS3Storage(options?: S3Options): multer.StorageEngine {
    const s3 = new S3({
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY'),
      },
      region: this.configService.get('S3_REGION'),
    });
    return multerS3({
      s3,
      bucket: this.configService.get('S3_BUCKET_NAME'),
    });
  }

  getStorage(options?: StorageOptions): multer.StorageEngine {
    switch (this.storageType) {
      case FILE_MANAGERS.fs:
        return this._getFilesystemStorage(options as multer.DiskStorageOptions);
      case FILE_MANAGERS.s3:
        return this._getS3Storage(options as S3Options);
      default:
        console.warn('No FILE_MANAGER env variable found -> defaults to FileStorage');
        return this._getFilesystemStorage(options as multer.DiskStorageOptions);
    }
  }
}
