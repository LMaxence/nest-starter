import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { EnvConfig } from './interfaces';

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor() {
    const configFilePath = `${process.env.NODE_ENV || 'development'}.env`;
    const configFolderPath = process.env.NODE_ENV === 'test' ? '../../config' : '../../../config';
    const envPath = path.resolve(__dirname, configFolderPath, configFilePath);
    this.envConfig = dotenv.parse(fs.readFileSync(envPath));
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
