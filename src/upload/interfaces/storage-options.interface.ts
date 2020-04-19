import * as multer from 'multer';

export interface S3Options {
  s3: AWS.S3;
  bucket:
    | ((
        req: Express.Request,
        file: Express.Multer.File,
        callback: (error: any, bucket?: string) => void
      ) => void)
    | string;
  key?(
    req: Express.Request,
    file: Express.Multer.File,
    callback: (error: any, key?: string) => void
  ): void;
  acl?:
    | ((
        req: Express.Request,
        file: Express.Multer.File,
        callback: (error: any, acl?: string) => void
      ) => void)
    | string;
  contentType?(
    req: Express.Request,
    file: Express.Multer.File,
    callback: (error: any, mime?: string, stream?: NodeJS.ReadableStream) => void
  ): void;
  metadata?(
    req: Express.Request,
    file: Express.Multer.File,
    callback: (error: any, metadata?: any) => void
  ): void;
  cacheControl?:
    | ((
        req: Express.Request,
        file: Express.Multer.File,
        callback: (error: any, cacheControl?: string) => void
      ) => void)
    | string;
  serverSideEncryption?:
    | ((
        req: Express.Request,
        file: Express.Multer.File,
        callback: (error: any, serverSideEncryption?: string) => void
      ) => void)
    | string;
}

export type StorageOptions = multer.DiskStorageOptions | S3Options;
