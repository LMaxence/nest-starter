import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { usersProviders } from './users.providers';
import { DatabaseModule } from 'src/database/database.module';
import { UsersController } from './users.controller';
import { HelpersModule } from 'src/helpers/helpers.module';
import { IsAuthenticatedUserGuard } from './guards/is-authenticated-user.guard';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [DatabaseModule, HelpersModule, UploadModule],
  providers: [UsersService, ...usersProviders, IsAuthenticatedUserGuard],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
