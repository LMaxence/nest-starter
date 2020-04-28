/* eslint-disable @typescript-eslint/no-unused-vars */
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

const emailServiceMock = {
  sendMail: async (
    options: Mail.Options,
    templateName: string,
    data: any
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) => {},
};

const createdUserIds: number[] = [];

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
  const userDetails = {
    email: faker.fake('{{internet.email}}'),
    password: faker.fake('{{internet.password}}'),
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
let registerAndLogin: () => Promise<{ user: User; accessToken: string }>;

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let server: HttpServer;
  let usersRepository: Repository<User>;
  let emailService: EmailService;
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
    emailService = app.get<EmailService>(EmailService);
    registerAndLogin = buildRegisterAndLogin(server, usersRepository, cryptoService);
  });

  afterAll(async () => {
    await usersRepository.delete(createdUserIds);
    const connection = app.get<Connection>(DATABASE_CONNECTION);
    connection.close();
  });

  describe('POST /users', () => {
    it('creates a new user when provided data is valid', async () => {
      const email = faker.fake('{{internet.email}}');
      const password = faker.fake('{{internet.password}}');
      const mailSpy = jest.spyOn(emailService, 'sendMail');
      return await request(server)
        .post('/users')
        .send({
          email: email,
          password: password,
        })
        .expect(201)
        .then(response => {
          const { id } = response.body;
          createdUserIds.push(id);
          expect(mailSpy).toHaveBeenCalled();
          mailSpy.mockClear();
        });
    });

    it('returns 409 when email is already taken', async () => {
      const { user } = await registerAndLogin();
      const mailSpy = jest.spyOn(emailService, 'sendMail');
      return request(server)
        .post('/users')
        .send({
          email: user.email,
          password: faker.fake('{{internet.password}}'),
        })
        .expect(409)
        .then(() => {
          expect(mailSpy).not.toHaveBeenCalled();
          mailSpy.mockClear();
        });
    });
  });

  describe('GET /users', () => {
    it('returns a 401 when user is not authenticated', () => {
      return request(server)
        .get('/users')
        .expect(401);
    });

    it('returns a list of users when user is authenticated', async () => {
      const { accessToken } = await registerAndLogin();
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
      const { accessToken, user } = await registerAndLogin();
      return await request(server)
        .get(`/users/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then(response => {
          const returnedUser = response.body;
          console.log(returnedUser);
          expect(returnedUser.id).toBe(user.id);
          expect(returnedUser.password).toBeUndefined();
        });
    });

    it('returns 404 when the requested user is not found', async () => {
      const { accessToken } = await registerAndLogin();
      return await request(server)
        .get('/users/fakeId')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('GET /users/me/profile', () => {
    it('returns a 401 when user is not authenticated', async () => {
      return await request(server)
        .get('/users/me/profile')
        .expect(401);
    });

    it('returns me when user is authenticated', async () => {
      const { accessToken, user } = await registerAndLogin();
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

  describe('PUT /users/:id', () => {
    it('returns a 401 when user is not authenticated', async () => {
      return await request(server)
        .put('/users/fakeId')
        .expect(401);
    });

    it('returns a 401 when user attemps to update another user', async () => {
      const { user: user1 } = await registerAndLogin();
      const { accessToken } = await registerAndLogin();
      return await request(server)
        .put(`/users/${user1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ isActive: false })
        .expect(401);
    });

    it('returns a 400 when password and confirmation do not match', async () => {
      const { user, accessToken } = await registerAndLogin();
      return await request(server)
        .put(`/users/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          password: faker.fake('{{internet.password}}'),
          passwordConfirmation: 'wrongConfirmation',
        })
        .expect(400);
    });

    it('updates password when input is valid', async () => {
      const { user, accessToken } = await registerAndLogin();
      const newPassword = faker.fake('{{internet.password}}');
      return await request(server)
        .put(`/users/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ password: newPassword, passwordConfirmation: newPassword })
        .expect(200)
        .then(async () => {
          const updatedUser = await usersRepository.findOne(user.id);
          expect(await cryptoService.compare(newPassword, updatedUser.password)).toBeTruthy();
        });
    });

    it('updates the user when user is authenticated', async () => {
      const { accessToken, user } = await registerAndLogin();
      expect(user.isActive).toBeTruthy();
      return await request(server)
        .put(`/users/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ isActive: false })
        .expect(200)
        .then(async () => {
          const updatedUser = await usersRepository.findOne({
            where: { id: user.id },
          });
          expect(updatedUser.isActive).toBeFalsy();
        });
    });
  });

  describe('POST /users/email/reset', () => {
    it('return a 409 if the email is already taken', async () => {
      const { accessToken } = await registerAndLogin();
      const { user } = await registerAndLogin();
      const newEmail = user.email;
      const mailSpy = jest.spyOn(emailService, 'sendMail');
      return await request(server)
        .post('/users/email/reset')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ newEmail: newEmail })
        .expect(409)
        .then(() => {
          expect(mailSpy).not.toHaveBeenCalled();
          mailSpy.mockClear();
        });
    });

    it('sends an email to the new address when user is authenticated', async () => {
      const { accessToken } = await registerAndLogin();
      const newEmail = 'newEmail@test.com';
      const mailSpy = jest.spyOn(emailService, 'sendMail');
      return await request(server)
        .post('/users/email/reset')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ newEmail: newEmail })
        .expect(200)
        .then(() => {
          expect(mailSpy).toHaveBeenCalled();
          mailSpy.mockClear();
        });
    });
  });

  describe('GET /users/email/confirm', () => {
    it('confirms an email address when provided token is correct', async () => {
      const { user, accessToken } = await registerAndLogin();
      const fakeToken = faker.fake('{{internet.password}}');
      const newEmail = faker.fake('{{internet.email}}');

      user.emailCandidate = newEmail;
      user.emailProofToken = fakeToken;
      user.emailProofTokenExpiresAt = new Date(Date.now() + 3600 * 1000);
      await usersRepository.save(user);

      return await request(server)
        .get('/users/email/confirm')
        .query({ token: fakeToken })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then(async () => {
          const updatedUser = await usersRepository.findOne({
            where: { id: user.id },
          });
          expect(updatedUser.emailCandidate).toBeNull();
          expect(updatedUser.email).toBe(newEmail);
        });
    });

    it('returns 404 when provided token is invalid', async () => {
      const { accessToken } = await registerAndLogin();

      await request(server)
        .post('/users/email/reset')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ newEmail: 'fake@fake.test' });

      return await request(server)
        .get('/users/email/confirm')
        .query({ token: '' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('POST /users/password/reset', () => {
    it('returns a 404 when provided email is not found', async () => {
      return await request(server)
        .post('/users/password/reset')
        .send({ email: 'fake@fake.test' })
        .expect(404);
    });

    it('send an email with the link for resetting password if the email is correct', async () => {
      const { user } = await registerAndLogin();
      const mailSpy = jest.spyOn(emailService, 'sendMail');
      return await request(server)
        .post('/users/password/reset')
        .send({ email: user.email })
        .expect(200)
        .then(() => {
          expect(mailSpy).toHaveBeenCalled();
          mailSpy.mockClear();
        });
    });
  });

  describe('PUT /users/password/reset', () => {
    it('returns a 404 if provided token is incorrect', async () => {
      const newPassword = faker.fake('{{internet.password}}');
      return await request(server)
        .put('/users/password/reset')
        .send({
          token: 'fakeToken',
          password: newPassword,
          passwordConfirmation: newPassword,
        })
        .expect(404);
    });

    it('updates password if provided token is valid and password match', async () => {
      const { user } = await registerAndLogin();
      const fakeToken = faker.fake('{{internet.password}}');
      const newPassword = faker.fake('{{internet.password}}');

      user.passwordResetToken = fakeToken;
      user.passwordResetTokenExpiresAt = new Date(Date.now() + 3600 * 1000);
      await usersRepository.save(user);

      return await request(server)
        .put('/users/password/reset')
        .send({
          token: fakeToken,
          password: newPassword,
          passwordConfirmation: newPassword,
        })
        .expect(200)
        .then(async () => {
          const updatedUser = await usersRepository.findOne(user.id);
          expect(await cryptoService.compare(newPassword, updatedUser.password)).toBeTruthy();
        });
    });
  });

  describe('DELETE /users/id', () => {
    it('returns 401 if the requesting user is different from the targeted user', async () => {
      const { user } = await registerAndLogin();
      const { accessToken } = await registerAndLogin();

      await request(server)
        .delete(`/users/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });

    it('deletes a user', async () => {
      const { user, accessToken } = await registerAndLogin();

      await request(server)
        .delete(`/users/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then(async () => {
          expect(await usersRepository.findOne(user.id.toString())).toBeUndefined();
        });
    });
  });
});
