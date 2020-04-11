import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseInterceptors,
  Delete,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto';
import {
  USERS_ENDPOINT,
  USER_NOT_FOUND_ERROR_MESSAGE,
  USER_DELETION_SUCCESS_MESSAGE,
} from './user.constants';
import { UsersInterceptor } from './users.interceptor';
import { UserSerializer } from './users.serializer';
import { UpdateUserDTO } from './dto/update-user.dto';

@UseInterceptors(new UsersInterceptor(new UserSerializer()))
@Controller(USERS_ENDPOINT)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDTO) {
    return this.usersService.create(createUserDto);
  }

  @Get('')
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_ERROR_MESSAGE);
    }
    return user;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDTO) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_ERROR_MESSAGE);
    }
    return this.usersService.update(user.id.toString(), updateUserDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_ERROR_MESSAGE);
    }
    this.usersService.delete(id);
    return USER_DELETION_SUCCESS_MESSAGE;
  }
}
