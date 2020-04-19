import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication, HttpServer, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DATABASE_CONNECTION } from 'src/database/constants';
import { Connection, Repository, DeepPartial } from 'typeorm';
import { CryptoService } from 'src/helpers/crypto/crypto.service';
import { User } from 'src/users/user.entity';
import { USERS_REPOSITORY } from 'src/users/user.constants';
import * as faker from 'faker';
import { EmailService } from 'src/helpers/email/email.service';
import Mail = require('nodemailer/lib/mailer');
import * as path from 'path';
import * as fs from 'fs';

const emailServiceMock = {
  sendMail: async (
    options: Mail.Options,
    templateName: string,
    data: any
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) => {},
};

const createdUserIds: number[] = [];
const savedFilenames: string[] = [];

const untrackFile = (filename: string) => {
  for (let i = 0; i < savedFilenames.length; i++) {
    if (savedFilenames[i] === filename) {
      savedFilenames.splice(i, 1);
      break;
    }
  }
};

const login = async (
  server: HttpServer,
  email: string,
  password: string
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

const addUser = async (repository: Repository<User>, data: DeepPartial<User>): Promise<void> => {
  const newUser = await repository.save(repository.create(data));
  createdUserIds.push(newUser.id);
  newUser.isActive = true;
  await repository.save(newUser);
};

const buildRegisterAndLogin = (
  server: HttpServer,
  usersRepository: Repository<User>,
  cryptoService: CryptoService
) => async () => {
  const email = faker.fake('{{internet.email}}');
  const password = faker.fake('{{internet.password}}');
  await request(server)
    .post('/users')
    .field('email', email)
    .field('password', password)
    .attach('picture', path.join(__dirname, 'temp', 'avatar.jpg'))
    .then(res => {
      savedFilenames.push(res.body.avatar);
    });
  return {
    accessToken: await login(server, email, password),
    user: await usersRepository.findOne({
      where: { email },
    }),
  };
};
let registerAndLogin: () => Promise<{ user: User; accessToken: string }>;

describe('UsersController (avatars) (e2e)', () => {
  let app: INestApplication;
  let server: HttpServer;
  let usersRepository: Repository<User>;
  let cryptoService: CryptoService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue(emailServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    server = app.getHttpServer();
    await app.init();
    usersRepository = app.get<Repository<User>>(USERS_REPOSITORY);
    cryptoService = app.get<CryptoService>(CryptoService);
    registerAndLogin = buildRegisterAndLogin(server, usersRepository, cryptoService);
  });

  afterAll(async () => {
    await usersRepository.delete(createdUserIds);
    const connection = app.get<Connection>(DATABASE_CONNECTION);
    connection.close();
    await Promise.all(
      savedFilenames.map(fileName => {
        return fs.unlinkSync(path.join(__dirname, 'temp', fileName));
      })
    );
  });

  describe('POST /users', () => {
    it('saves the picture provided in a "avatar" field', async () => {
      const email = faker.fake('{{internet.email}}');
      const password = faker.fake('{{internet.password}}');
      return await request(server)
        .post('/users')
        .field('email', email)
        .field('password', password)
        .attach('picture', path.join(__dirname, 'temp', 'avatar.jpg'))
        .expect(201)
        .then(response => {
          const { id, avatar } = response.body;
          createdUserIds.push(id);
          expect(avatar).toBeDefined();
          savedFilenames.push(avatar);
        });
    });
  });

  describe('GET /users/:id/avatar', () => {
    it('retrieves a user avatar when it exists', async () => {
      const { accessToken, user } = await registerAndLogin();
      return await request(server)
        .get(`/users/${user.id}/avatar`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then(res => {
          expect(res.body).toBeInstanceOf(Buffer);
        });
    });

    it('return 401 if the user is not authenticated', async () => {
      const { user } = await registerAndLogin();
      return await request(server)
        .get(`/users/${user.id}/avatar`)
        .expect(401);
    });

    it('returns 404 if the user does not exist', async () => {
      const { accessToken } = await registerAndLogin();
      return await request(server)
        .get('/users/fakeId/avatar')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('returns 404 if the user has no avatar', async () => {
      const { accessToken, user } = await registerAndLogin();
      user.avatar = null;
      await usersRepository.save(user);
      return await request(server)
        .get(`/users/${user.id}/avatar`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('PUT /users/:id', () => {
    it('updates the avatar when a file is provided', async () => {
      const { accessToken, user } = await registerAndLogin();
      const oldAvatar = user.avatar;
      return await request(server)
        .put(`/users/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('picture', path.join(__dirname, 'temp', 'avatar.jpg'))
        .expect(200)
        .then(async res => {
          const updatedUser = await usersRepository.findOne(user.id);
          expect(updatedUser.avatar).toBeDefined();
          expect(updatedUser.avatar).not.toBe(oldAvatar);
          savedFilenames.push(updatedUser.avatar);
          untrackFile(oldAvatar);
          await new Promise(resolve =>
            fs.access(path.join(__dirname, 'temp', oldAvatar), fs.constants.F_OK, err => {
              expect(!!err).toBeTruthy();
              resolve();
            })
          );
        });
    });
  });

  describe('DELETE /users/:id', () => {
    it('deletes the avatar when a user is deleted', async () => {
      const { accessToken, user } = await registerAndLogin();
      const avatartPath = path.join(__dirname, 'temp', user.avatar);
      return await request(server)
        .delete(`/users/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then(async res => {
          await new Promise(resolve =>
            fs.access(avatartPath, fs.constants.F_OK, err => {
              expect(!!err).toBeTruthy();
              resolve();
            })
          );
          untrackFile(user.avatar);
        });
    });
  });
});
