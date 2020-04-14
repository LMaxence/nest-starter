import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedRequest } from 'src/auth/interfaces';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

const INVALID_USER_MESSAGE = 'Invalid user';
const NO_TOKEN_PROVIDED_MESSAGE = 'No credentials token provided';

@Injectable()
export class IsAuthenticatedUserGuard extends JwtAuthGuard {
  async checkRequestValidity(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { user } = request;
    if (user.id.toString() === request.params.id) {
      return true;
    }
    throw new UnauthorizedException(INVALID_USER_MESSAGE);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (await super.canActivate(context)) {
      return await this.checkRequestValidity(context);
    }
    throw new UnauthorizedException(NO_TOKEN_PROVIDED_MESSAGE);
  }
}
