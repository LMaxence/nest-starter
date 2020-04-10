import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';
import { DATABASE_CONNECTION } from './constants';

@Module({
  providers: [...databaseProviders],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
