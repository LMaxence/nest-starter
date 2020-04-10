import { DynamicModule, Module, Global } from '@nestjs/common';
import { ConfigService } from './config.service';

export interface ConfigModuleOptions {
  folder: string;
}

@Global()
@Module({})
export class ConfigModule {
  static register(): DynamicModule {
    return {
      module: ConfigModule,
      providers: [ConfigService],
      exports: [ConfigService],
    };
  }
}
