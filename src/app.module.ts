import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    ConfigModule.register({ folder: './config' }),
    AuthModule,
    UsersModule,
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
