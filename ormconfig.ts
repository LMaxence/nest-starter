import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const testEnvFile = path.resolve(__dirname, 'config', 'test.env');
const testEnvConfig = dotenv.parse(fs.readFileSync(testEnvFile));

const ormconfig = [
  {
    name: 'default',
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'marketplaces',
    password: 'password',
    database: 'marketplaces-db',
    entities: ['*.entity{.ts,.js}'],
    synchronize: false,
    migrationsRun: true,
    logging: true,
    logger: 'file',
    migrations: ['src/migrations/**/*{.ts,.js}'],
    cli: {
      migrationsDir: 'src/migrations',
    },
  },
  {
    name: 'test',
    type: 'mysql',
    host: 'localhost',
    port: 3307,
    database: testEnvConfig['MYSQL_DATABASE'],
    username: testEnvConfig['APP_NAME'],
    password: testEnvConfig['MYSQL_PASSWORD'],
    entities: ['*.entity{.ts,.js}'],
    synchronize: false,
    migrationsRun: true,
    logging: true,
    logger: 'file',
    migrations: ['src/migrations/**/*{.ts,.js}'],
    cli: {
      migrationsDir: 'src/migrations',
    },
  },
];

if (process.env.NODE_ENV === 'development') {
  const devEnvFile = path.resolve(__dirname, 'config', 'development.env');
  const devEnvConfig = dotenv.parse(fs.readFileSync(devEnvFile));

  ormconfig.push({
    name: 'development',
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: devEnvConfig['APP_NAME'],
    password: devEnvConfig['MYSQL_PASSWORD'],
    database: devEnvConfig['MYSQL_DATABASE'],
    entities: ['*.entity{.ts,.js}'],
    synchronize: false,
    migrationsRun: true,
    logging: true,
    logger: 'file',
    migrations: ['src/migrations/**/*{.ts,.js}'],
    cli: {
      migrationsDir: 'src/migrations',
    },
  });
}

export = ormconfig;
