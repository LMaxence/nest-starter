import { Response } from 'express';
import { ConfigService } from 'src/config/config.service';
import { Inject } from '@nestjs/common';

export abstract class AbstractFileManagerService {
  root: string;

  constructor(@Inject(ConfigService) public readonly configService: ConfigService) {
    this.root = this.configService.get('FILE_STORAGE_ROOT');
  }

  abstract delete(fileName: string): Promise<void>;
  abstract resolveName(file: Express.Multer.File): string;
  abstract serveFile(res: Response, fileName: string): void;
}
