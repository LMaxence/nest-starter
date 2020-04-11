import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserSerializer } from './users.serializer';
import { User } from './user.entity';

@Injectable()
export class UsersInterceptor implements NestInterceptor {
  serializer: UserSerializer;

  constructor(serializer: UserSerializer) {
    this.serializer = serializer;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        if (data instanceof User) {
          return this.serializer.serialize(data);
        }
        if (data instanceof Array && data.length > 0) {
          if (data[0] instanceof User) {
            return this.serializer.serializeCollection(data);
          }
        }
        return data;
      }),
    );
  }
}
