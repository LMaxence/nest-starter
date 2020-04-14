import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication, HttpServer } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DATABASE_CONNECTION } from 'src/database/constants';
import { Connection, Repository } from 'typeorm';
import { USERS_REPOSITORY } from 'src/users/user.constants';
import { User } from 'src/users/user.entity';
import { CryptoService } from 'src/helpers/crypto/crypto.service';
import * as faker from 'faker';

describe('AuthController (e2e) /auth', () => {
  let app: INestApplication;
  let server: HttpServer;
  let usersRepository: Repository<User>;
  let cryptoService: CryptoService;

  let email: string;
  let password: string;

  let user: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    email = faker.fake('{{internet.email}}');
    password = faker.fake('{{internet.password}}');

    app = moduleFixture.createNestApplication();
    server = app.getHttpServer();
    usersRepository = app.get<Repository<User>>(USERS_REPOSITORY);
    cryptoService = app.get<CryptoService>('CryptoService');
    const hashedPassword = await cryptoService.hash(password);
    user = usersRepository.create({
      email: email,
      isActive: true,
      password: hashedPassword,
    });
    user = await usersRepository.save(user);
    await app.init();
  });

  afterAll(async () => {
    await usersRepository.delete(user.id);
    const connection = app.get<Connection>(DATABASE_CONNECTION);
    connection.close();
  });

  describe('POST /auth/login', () => {
    it('returns an access_token when correct credentials are provided', async () => {
      return await request(server)
        .post('/auth/login')
        .send({ email, password })
        .expect(200)
        .then((response) => {
          const { access_token: accessToken } = response.body;
          expect(accessToken).toBeDefined();
        });
    });

    it('returns 401 when credentials are invalid', async () => {
      return await request(server).post('/auth/login').send({ email, password: 'wrongPassword' }).expect(401);
    });

    it('returns 404 when user is not found', async () => {
      return await request(server).post('/auth/login').send({ email: 'fake_email@mail.com', password }).expect(404);
    });
  });
});
