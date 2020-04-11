import { User } from './user.entity';
import { SerializedUser } from './interfaces/serialized-user.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserSerializer {
  serialize(entity: User): SerializedUser {
    const { password, ...serializedUser } = entity;
    return serializedUser;
  }

  serializeCollection(entities: User[]): SerializedUser[] {
    return entities.map(entity => this.serialize(entity));
  }
}
