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
  BadRequestException,
  ConflictException,
  UseGuards,
  Request,
  HttpCode,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDTO,
  UpdateUserDTO,
  UpdateEmailDTO,
  RequestPasswordUpdateDTO,
  UpdatePasswordDTO,
} from './dto';
import {
  USERS_ENDPOINT,
  USER_DELETION_SUCCESS_MESSAGE,
  USER_EMAIL_REQUEST_SENT_MESSAGE,
  USER_EMAIL_UPDATE_SUCCESS_MESSAGE,
  USER_PASSWORD_REQUEST_SENT_MESSAGE,
  PASSWORD_DO_NOT_MATCH_MESSAGE,
  USER_PASSWORD_UPDATE_SUCCESS_MESSAGE,
  USER_ALREADY_EXISTS_MESSAGE,
  PASSWORD_AND_CONFIRMATION_DO_NOT_MATCH_MESSAGE,
} from './user.constants';
import { NotFoundFilter } from 'src/helpers/filters/not-found.filter';
import { User } from './user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IsAuthenticatedUserGuard } from './guards/is-authenticated-user.guard';
import { AuthenticatedRequest } from 'src/auth/interfaces';
import { FsUploadInterceptor } from 'src/upload/fs-upload.interceptor';

@Controller(USERS_ENDPOINT)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('')
  @UseInterceptors(FsUploadInterceptor('picture'))
  async create(@Body() createUserDto: CreateUserDTO, @Request() req) {
    if (req.files.length) {
      createUserDto.avatar = req.files[0].filename;
    }
    if (!(await this.usersService.getEmailAvailability(createUserDto.email))) {
      throw new ConflictException(USER_ALREADY_EXISTS_MESSAGE);
    }
    const user = await this.usersService.create(createUserDto);
    return user.toRaw();
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return User.serializeCollection(await this.usersService.findAll());
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseFilters(NotFoundFilter)
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findByIdOrFail(id);
    return user.toRaw();
  }

  @Get('/:id/avatar')
  @UseGuards(JwtAuthGuard)
  @UseFilters(NotFoundFilter)
  async findAvatar(@Param('id') id: string) {
    const user = await this.usersService.findByIdOrFail(id);
    const avatar = user.avatar;
  }

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  @UseFilters(NotFoundFilter)
  async getProfile(@Request() req: AuthenticatedRequest) {
    return req.user.toRaw();
  }

  @Put(':id')
  @UseGuards(IsAuthenticatedUserGuard)
  @UseFilters(NotFoundFilter)
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDTO) {
    if (updateUserDto.password) {
      const { password, passwordConfirmation } = updateUserDto;
      if (password !== passwordConfirmation) {
        throw new BadRequestException(PASSWORD_AND_CONFIRMATION_DO_NOT_MATCH_MESSAGE);
      }
      await this.usersService.updatePasswordWithoutToken(id, updateUserDto.password);
    }

    delete updateUserDto.password;
    delete updateUserDto.passwordConfirmation;

    const user = Object.keys(updateUserDto).length
      ? await this.usersService.update(id, updateUserDto)
      : await this.usersService.findByIdOrFail(id);
    return user.toRaw();
  }

  @Post('/email/reset')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async requestEmailConfirmation(@Body() updateEmailDTO: UpdateEmailDTO, @Request() request) {
    const { newEmail } = updateEmailDTO;
    if (!(await this.usersService.getEmailAvailability(newEmail))) {
      throw new ConflictException(USER_ALREADY_EXISTS_MESSAGE);
    }
    await this.usersService.requestEmailConfirmation(request.user.id, newEmail);
    return USER_EMAIL_REQUEST_SENT_MESSAGE;
  }

  @Get('/email/confirm')
  @UseFilters(NotFoundFilter)
  async updateEmail(@Query('token') token: string) {
    await this.usersService.confirmEmail(token);
    return USER_EMAIL_UPDATE_SUCCESS_MESSAGE;
  }

  @Post('/password/reset')
  @UseFilters(NotFoundFilter)
  @HttpCode(200)
  async requestPasswordUpdate(@Body() requestPasswordUpdateDTO: RequestPasswordUpdateDTO) {
    const { email } = requestPasswordUpdateDTO;
    await this.usersService.requestPasswordUpdate(email);
    return USER_PASSWORD_REQUEST_SENT_MESSAGE;
  }

  @Put('/password/reset')
  @UseFilters(NotFoundFilter)
  async updatePassword(@Body() requestPasswordUpdateDTO: UpdatePasswordDTO) {
    const { token, password, passwordConfirmation } = requestPasswordUpdateDTO;
    if (password !== passwordConfirmation) {
      throw new BadRequestException(PASSWORD_DO_NOT_MATCH_MESSAGE);
    }
    await this.usersService.updatePassword(token, password);
    return USER_PASSWORD_UPDATE_SUCCESS_MESSAGE;
  }

  @Delete(':id')
  @UseGuards(IsAuthenticatedUserGuard)
  async delete(@Param('id') id: string) {
    await this.usersService.delete(id);
    return USER_DELETION_SUCCESS_MESSAGE;
  }
}
