import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { usersProviders } from './users.providers';
import { DatabaseModule } from 'src/database/database.module';
import { UsersController } from './users.controller';
import { UserSerializer } from './users.serializer';

@Module({
  imports: [DatabaseModule],
  providers: [UsersService, ...usersProviders, UserSerializer],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
