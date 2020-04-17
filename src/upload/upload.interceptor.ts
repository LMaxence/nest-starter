import { CallHandler, ExecutionContext, NestInterceptor, InternalServerErrorException, Type } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UploadService, UploadOptions } from './upload.service';
import { UPLOAD_FAILURE_MESSAGE } from './upload.constants';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ConfigService } from 'src/config/config.service';

export interface UploadInterceptorOptions extends UploadOptions {
  fieldName: string;
  maxCount?: number;
}

const configService = new ConfigService();

export function UploadInterceptor(
  fieldName: string,
  options?: UploadInterceptorOptions,
  storageOptions?: MulterOptions
): Type<NestInterceptor> {
  class FileUploadInterceptor implements NestInterceptor {
    options: UploadInterceptorOptions;
    storageOptions: MulterOptions;
    private uploadService = new UploadService(configService);

    constructor() {
      this.options = options;
      this.storageOptions = storageOptions;
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const ctx = context.switchToHttp();

      await new Promise((resolve, reject) => {
        this.uploadService.upload(fieldName, this.options, this.storageOptions)(
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
      return next.handle();
    }
  }

  return FileUploadInterceptor;
}
