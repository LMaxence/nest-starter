import {
  Controller,
  Request,
  Post,
  UseGuards,
  UseFilters,
  HttpCode,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { AUTH_ENDPOINT } from './auth.constants';
import { NotFoundFilter } from 'src/helpers/filters/not-found.filter';

@Controller(AUTH_ENDPOINT)
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @UseFilters(NotFoundFilter)
  @Post('login')
  @HttpCode(200)
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
