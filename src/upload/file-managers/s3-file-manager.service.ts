import { Injectable, Inject, NotFoundException } from '@nestjs/common';

import { Response } from 'express';
import { AbstractFileManagerService } from './abstract-file-manager.service';

import { S3 } from 'aws-sdk';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class S3FileManagerService extends AbstractFileManagerService {
  s3: S3;

  constructor(@Inject(ConfigService) public readonly configService: ConfigService) {
    super(configService);
    this.s3 = new S3({
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY'),
      },
      region: this.configService.get('S3_REGION'),
    });
  }

  async delete(fileName: string) {
    await new Promise((resolve, reject) => {
      this.s3.deleteObject(
        {
          Bucket: this.configService.get('S3_BUCKET_NAME'),
          Key: fileName,
        },
        (err, data) => {
          if (err) reject(err);
          resolve(data);
        }
      );
    });
  }

  resolveName(file: Express.MulterS3.File): string {
    return file.key;
  }

  serveFile(res: Response, fileName: string) {
    const imgStream = this.s3
      .getObject(
        {
          Bucket: this.configService.get('S3_BUCKET_NAME'),
          Key: fileName,
        },
        (err, data) => {
          if (err) throw new NotFoundException('File not found');
          return data;
        }
      )
      .createReadStream();
    imgStream.pipe(res);
  }
}
