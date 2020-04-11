import { Connection } from 'typeorm';
import { User } from './user.entity';
import { DATABASE_CONNECTION } from 'src/database/constants';
import { USERS_REPOSITORY } from './user.constants';

export const usersProviders = [
  {
    provide: USERS_REPOSITORY,
    useFactory: (connection: Connection) => connection.getRepository(User),
    inject: [DATABASE_CONNECTION],
  },
];
