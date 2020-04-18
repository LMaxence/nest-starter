import { NestInterceptor, Type } from '@nestjs/common';

import { FsUploadService } from './fs-upload.service';

import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ConfigService } from 'src/config/config.service';
import { TokenService } from 'src/helpers/token/token.service';

import { UploadOptions } from './interfaces';
import { AbstractUploadInterceptor } from './abstract-upload.interceptor';


export interface FsUploadInterceptorOptions extends UploadOptions {
  fieldName: string;
  maxCount?: number;
}

const configService = new ConfigService();
const tokenService = new TokenService();

export function FsUploadInterceptor(
  fieldName: string,
  options?: FsUploadInterceptorOptions,
  storageOptions?: MulterOptions
): Type<NestInterceptor> {
  class FsUploadInterceptor extends AbstractUploadInterceptor<FsUploadInterceptorOptions> {
    fieldName = fieldName
    options = options;
    storageOptions = storageOptions;
    uploadService = new FsUploadService(configService, tokenService);
  }

  return FsUploadInterceptor;
}
