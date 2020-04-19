import { Response } from 'express';
import multer = require('multer');
import { ConfigService } from 'src/config/config.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class AbstractFileManagerService {
  root: string;

  constructor(private configService: ConfigService) {
    this.root = this.configService.get('FILE_STORAGE_ROOT');
  }

  abstract delete(fileName: string): Promise<void>;
  abstract resolveName(file: Express.Multer.File): string;
  abstract serveFile(res: Response, fileName: string): void;
}
