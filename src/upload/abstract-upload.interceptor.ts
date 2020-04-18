import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common';
import { AbstractUploadService } from './abstract-upload.service';
import { Observable, throwError } from 'rxjs';
import { UPLOAD_FAILURE_MESSAGE } from './upload.constants';
import { catchError } from 'rxjs/operators';
import { UploadOptions } from './interfaces';

export interface UploadInterceptorOptions extends UploadOptions {
  fieldName: string;
}

// eslint-disable-next-line prettier/prettier
export abstract class AbstractUploadInterceptor<T extends UploadInterceptorOptions>
  implements NestInterceptor {
  fieldName: string;
  options?: T;
  storageOptions?: MulterOptions;
  uploadService: AbstractUploadService<T>;
  constructor() {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const ctx = context.switchToHttp();

    await new Promise((resolve, reject) => {
      this.uploadService.upload(this.fieldName, this.options, this.storageOptions)(
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
            await this.uploadService.delete(file.filename);
          });
        return throwError(err);
      })
    );
  }
}
