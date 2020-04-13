import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Connection } from 'typeorm';
import { DATABASE_CONNECTION } from 'src/database/constants';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  afterAll(async () => {
    const connection = app.get<Connection>(DATABASE_CONNECTION);
    connection.close();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('exists', () => {
    expect(app).toBeDefined();
  });
});
