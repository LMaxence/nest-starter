import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  Put,
  UseFilters,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto';
import {
  USERS_ENDPOINT,
  USER_DELETION_SUCCESS_MESSAGE,
  USER_EMAIL_REQUEST_SENT_MESSAGE,
  USER_EMAIL_UPDATE_SUCCESS_MESSAGE,
} from './user.constants';
import { UpdateUserDTO } from './dto/update-user.dto';
import { NotFoundFilter } from 'src/helpers/filters/not-found.filter';
import { User } from './user.entity';
import { UpdateEmailDTO } from './dto/update-email.dto';

@Controller(USERS_ENDPOINT)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDTO) {
    const user = await this.usersService.create(createUserDto);
    return user.toRaw();
  }

  @Get('')
  async findAll() {
    return User.serializeCollection(await this.usersService.findAll());
  }

  @Get(':id')
  @UseFilters(NotFoundFilter)
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return user.toRaw();
  }

  @Put(':id')
  @UseFilters(NotFoundFilter)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDTO) {
    const user = await this.usersService.update(id, updateUserDto);
    return user.toRaw();
  }

  @Put(':id/email')
  @UseFilters(NotFoundFilter)
  async requestEmailUpdate(
    @Param('id') id: string,
    @Body() updateEmailDTO: UpdateEmailDTO,
  ) {
    this.usersService.requestEmailUpdate(id, updateEmailDTO.newEmail);
    return USER_EMAIL_REQUEST_SENT_MESSAGE;
  }

  @Get(':id/email')
  @UseFilters(NotFoundFilter)
  async updateEmail(@Query('token') token: string) {
    await this.usersService.updateEmail(token);
    return USER_EMAIL_UPDATE_SUCCESS_MESSAGE;
  }

  @Delete(':id')
  @UseFilters(NotFoundFilter)
  async delete(@Param('id') id: string) {
    await this.usersService.delete(id);
    return USER_DELETION_SUCCESS_MESSAGE;
  }
}
