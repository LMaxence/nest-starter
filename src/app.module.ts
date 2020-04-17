import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { HelpersModule } from './helpers/helpers.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule, HelpersModule, AuthModule, UsersModule, UploadModule],
})
export class AppModule {}
