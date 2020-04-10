import { createConnection } from 'typeorm';
import { DATABASE_CONNECTION } from './constants';
import { ConfigService } from 'src/config/config.service';

export const databaseProviders = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: async (configService: ConfigService) => {
      return await createConnection({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: configService.get('APP_NAME'),
        password: configService.get('MYSQL_PASSWORD'),
        database: configService.get('MYSQL_DATABASE'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
      });
    },
    inject: [ConfigService],
  },
];
