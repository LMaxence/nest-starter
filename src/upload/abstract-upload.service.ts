import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { UploadOptions } from './interfaces';
import { Response } from 'express';

export abstract class AbstractUploadService<T extends UploadOptions> {
  baseDir: string;
  options: MulterOptions;

  abstract generateStorage(options: MulterOptions): any;
  abstract upload(fieldName: string, options: T, storageOptions: MulterOptions): any;
  abstract delete(fileName: string): Promise<void>;
  abstract addFile(res: Response, fileName: string): void;
}
