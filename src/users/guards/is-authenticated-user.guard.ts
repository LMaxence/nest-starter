import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from 'src/auth/interfaces';
import { UsersService } from '../users.service';

@Injectable()
export class IsAuthenticatedUserGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { user } = request;
    if (user) {
      return user.id.toString() === request.params.id;
    } else {
      return false;
    }
  }
}
