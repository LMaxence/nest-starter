import { createConnection } from 'typeorm';
import { DATABASE_CONNECTION } from './constants';
import { ConfigService } from 'src/config/config.service';

let connectionName: string;
switch (process.env.NODE_ENV) {
  case 'development':
    connectionName = 'default';
    break;
  case 'test':
    connectionName = 'test';
    break;
  default:
    connectionName = 'default';
}

export const databaseProviders = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: async (configService: ConfigService) => {
      return await createConnection({
        type: 'mysql',
        host: 'localhost',
        port: parseInt(configService.get('MYSQL_PORT') || '3306'),
        name: connectionName,
        username: configService.get('APP_NAME'),
        password: configService.get('MYSQL_PASSWORD'),
        database: configService.get('MYSQL_DATABASE'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      });
    },
    inject: [ConfigService],
  },
];
