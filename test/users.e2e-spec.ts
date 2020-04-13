import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication, HttpServer } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DATABASE_CONNECTION } from 'src/database/constants';
import { Connection, Repository } from 'typeorm';
import { CryptoService } from 'src/helpers/crypto/crypto.service';
import { User } from 'src/users/user.entity';
import { USERS_REPOSITORY } from 'src/users/user.constants';
import * as faker from 'faker';

const login = async (
  server: HttpServer,
  email: string,
  password: string,
): Promise<string | undefined> => {
  return await request(server)
    .post('/auth/login')
    .send({
      email: email,
      password: password,
    })
    .then(response => {
      return response.body['access_token'];
    });
};

const addUser = async (repository: Repository<User>, data): Promise<void> => {
  await repository.save(repository.create(data));
};

const registerAndLogin = async (
  server: HttpServer,
  usersRepository: Repository<User>,
  cryptoService: CryptoService,
) => {
  const userDetails = {
    email: faker.fake('{{internet.email}}'),
    password: faker.fake('{{internet.password}}'),
    isActive: true,
  };
  await addUser(usersRepository, {
    ...userDetails,
    password: await cryptoService.hash(userDetails.password),
  });
  return {
    accessToken: await login(server, userDetails.email, userDetails.password),
    user: await usersRepository.findOne({
      where: { email: userDetails.email },
    }),
  };
};

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let server: HttpServer;
  let usersRepository: Repository<User>;
  let cryptoService: CryptoService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    server = app.getHttpServer();
    await app.init();
    usersRepository = app.get<Repository<User>>(USERS_REPOSITORY);
    cryptoService = app.get<CryptoService>(CryptoService);
  });

  afterAll(async () => {
    const connection = app.get<Connection>(DATABASE_CONNECTION);
    connection.close();
  });

  describe('GET /users', () => {
    it('returns a 401 when user is not authenticated', () => {
      return request(server)
        .get('/users')
        .expect(401);
    });

    it('returns a list of users when user is authenticated', async () => {
      const { accessToken } = await registerAndLogin(
        server,
        usersRepository,
        cryptoService,
      );
      return await request(server)
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then(response => {
          expect(response.body).toBeInstanceOf(Array);
        });
    });
  });

  describe('GET /users/:id', () => {
    it('returns a 401 when user is not authenticated', async () => {
      return await request(server)
        .get('/users/1')
        .expect(401);
    });

    it('returns the requested user when user is authenticated', async () => {
      const { accessToken, user } = await registerAndLogin(
        server,
        usersRepository,
        cryptoService,
      );
      return await request(server)
        .get(`/users/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then(response => {
          const returnedUser = response.body;
          expect(returnedUser.id).toBe(user.id);
        });
    });

    it('returns 404 when the requested user is not found', async () => {
      const { accessToken } = await registerAndLogin(
        server,
        usersRepository,
        cryptoService,
      );
      return await request(server)
        .get(`/users/fakeId`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('GET /me/profile', () => {
    it('returns a 401 when user is not authenticated', async () => {
      return await request(server)
        .get('/users/me/profile')
        .expect(401);
    });

    it('returns the me when user is authenticated', async () => {
      const { accessToken, user } = await registerAndLogin(
        server,
        usersRepository,
        cryptoService,
      );
      return await request(server)
        .get('/users/me/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then(response => {
          const returnedUser = response.body;
          expect(returnedUser.id).toBe(user.id);
        });
    });
  });
});
