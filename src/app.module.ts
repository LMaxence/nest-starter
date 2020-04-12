import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './helpers/email/email.module';
import { HelpersModule } from './helpers/helpers.module';

@Module({
  imports: [
    ConfigModule.register(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ConfigModule,
    DatabaseModule,
    EmailModule,
    HelpersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
