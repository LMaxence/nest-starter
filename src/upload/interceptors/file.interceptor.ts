import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
  Type,
} from '@nestjs/common';

import { Observable, throwError } from 'rxjs';
import { UPLOAD_FAILURE_MESSAGE } from '../upload.constants';
import { catchError } from 'rxjs/operators';
import { StorageOptions } from '../interfaces';
import { StorageService } from '../storage/storage.service';
import multer = require('multer');
import { ConfigService } from 'src/config/config.service';
import { TokenService } from 'src/helpers/token/token.service';
import { FileService } from '../upload-manager.service';

const configService = new ConfigService();
const tokenService = new TokenService();
const storageService = new StorageService(configService, tokenService);
const fileService = new FileService(configService);

export function FileInterceptor(
  fieldOptions: multer.Field,
  options?: MulterOptions,
  storageOptions?: StorageOptions
): Type<NestInterceptor> {
  class FileInterceptor implements NestInterceptor {
    storage: multer.StorageEngine;
    constructor() {
      this.storage = storageService.getStorage(storageOptions);
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const ctx = context.switchToHttp();

      await new Promise((resolve, reject) => {
        multer({
          storage: this.storage,
          ...options,
        }).array(fieldOptions.name, fieldOptions.maxCount)(
          ctx.getRequest(),
          ctx.getResponse(),
          (err: any) => {
            if (err) {
              return reject(err);
            }
            resolve();
          }
        );
      }).catch(() => {
        throw new InternalServerErrorException(UPLOAD_FAILURE_MESSAGE);
      });
      return next.handle().pipe(
        catchError(err => {
          const files = ctx.getRequest().files;
          files &&
            files.forEach(async (file: any) => {
              await fileService.delete(file.filename);
            });
          return throwError(err);
        })
      );
    }
  }

  return FileInterceptor;
}
