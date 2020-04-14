import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { Test } from '@nestjs/testing';
import { HelpersModule } from 'src/helpers/helpers.module';
import { ConfigModule } from 'src/config/config.module';
import { USERS_REPOSITORY } from './user.constants';
import { EmailService } from 'src/helpers/email/email.service';
import { usersFixtures } from './fixtures/users.fixtures';
import { TokenService } from 'src/helpers/token/token.service';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { CryptoService } from 'src/helpers/crypto/crypto.service';

class MockRepository {
  async find() {
    return Promise.resolve(usersFixtures);
  }
  async findOne({ where }) {
    return Promise.resolve(
      usersFixtures.find(user => {
        return where.id ? user.id.toString() === where.id : user.email === where.email;
      })
    );
  }

  async findOneOrFail({ where }) {
    const user = await this.findOne({ where });
    if (!user) {
      throw new EntityNotFoundError('User', { where });
    }
    return user;
  }

  async save(user) {
    return user;
  }
}

const tokenServiceMock = {
  generateToken: () => 'fake_token',
};

const emailServiceMock = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  sendMail: () => {},
};

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: Repository<User>;
  let tokenService: TokenService;
  let emailService: EmailService;
  let cryptoService: CryptoService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), HelpersModule],
      providers: [
        {
          provide: USERS_REPOSITORY,
          useClass: MockRepository,
        },
        UsersService,
      ],
    })
      .overrideProvider(EmailService)
      .useValue(emailServiceMock)
      .overrideProvider(TokenService)
      .useValue(tokenServiceMock)
      .compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    usersRepository = moduleRef.get<Repository<User>>(USERS_REPOSITORY);
    tokenService = moduleRef.get<TokenService>(TokenService);
    emailService = moduleRef.get<EmailService>(EmailService);
    cryptoService = moduleRef.get<CryptoService>(CryptoService);
  });

  describe('findAll', () => {
    it('returns a list of users', async () => {
      expect((await usersService.findAll()).length).toBe(usersFixtures.length);
    });
  });

  describe('findById', () => {
    it('finds users by id', async () => {
      const user = await usersService.findById('1');
      expect(user.id).toBe(usersFixtures.find(user => user.id === 1).id);
    });

    it('returns undefined when user is not found', async () => {
      const user = await usersService.findById('100');
      expect(user).toBeUndefined();
    });
  });

  describe('findByEmail', () => {
    it('finds users by email', async () => {
      const emailAddress = usersFixtures[0].email;
      const user = await usersService.findByEmail(emailAddress);
      expect(user.id).toBe(usersFixtures.find(user => user.email === emailAddress).id);
    });

    it('returns undefined when user is not found', async () => {
      jest;
      const user = await usersService.findByEmail('no email');
      expect(user).toBeUndefined();
    });
  });

  describe('requestEmailConfirmation', () => {
    const user = usersFixtures[0];
    const id = user.id.toString();
    const newEmail = 'new_email@test.com';

    it('sends an email for confirming a new address', async () => {
      let emailCandidate;
      let emailProofToken;
      let emailProofTokenExpiresAt;
      jest.spyOn(usersRepository, 'save').mockImplementation(data => {
        emailCandidate = data.emailCandidate;
        emailProofToken = data.emailProofToken;
        emailProofTokenExpiresAt = data.emailProofTokenExpiresAt;
        return Promise.resolve(user);
      });
      const mailSentSpy = jest.spyOn(emailService, 'sendMail');
      await usersService.requestEmailConfirmation(id, newEmail);
      expect(mailSentSpy).toHaveBeenCalled();
      expect(emailCandidate).toBe(newEmail);
      expect(emailProofToken).toBe(tokenServiceMock.generateToken());
      expect(emailProofTokenExpiresAt).not.toBe(undefined);
    });

    it('throws when user is not found', () => {
      expect(async () => {
        await usersService.requestEmailConfirmation('fakeId', newEmail);
      }).rejects;
    });
  });

  describe('requestPasswordUpdate', () => {
    const user = usersFixtures[0];
    it('sends an email for resetting password', async () => {
      jest.spyOn(usersRepository, 'save').mockImplementation(data => {
        expect(data.passwordResetToken).toBe(tokenService.generateToken());
        expect(data.passwordResetTokenExpiresAt).not.toBe(undefined);
        return Promise.resolve(user);
      });
      const mailSentSpy = jest.spyOn(emailService, 'sendMail');
      await usersService.requestPasswordUpdate(user.email);
      expect(mailSentSpy).toHaveBeenCalled();
    });

    it('throws when user is not found', () => {
      expect(async () => {
        await usersService.requestPasswordUpdate('fake@mail.com');
      }).rejects;
    });

    describe('confirmEmail', () => {
      const oldEmail = 'test@test.com';
      const newEmail = 'new_mail@test.com';
      it('confirms an email if provided token is correct', async () => {
        const token = tokenService.generateToken();
        const user = new User();
        user.email = oldEmail;
        user.isActive = false;
        user.emailCandidate = newEmail;
        user.emailProofToken = token;
        user.emailProofTokenExpiresAt = new Date(Date.now() + 3600 * 1000);
        jest.spyOn(usersRepository, 'findOneOrFail').mockImplementation(() => {
          return Promise.resolve(user);
        });
        jest.spyOn(usersRepository, 'save').mockImplementation(data => {
          expect(data.emailCandidate).toBe(null);
          expect(data.emailProofToken).toBe(null);
          expect(data.emailProofTokenExpiresAt).toBe(null);
          expect(data.email).toBe(newEmail);
          expect(data.isActive).toBe(true);
          return Promise.resolve(user);
        });
        await usersService.confirmEmail(token);
      });

      it('throws when token is expired', async () => {
        const token = tokenService.generateToken();
        const user = new User();
        user.email = oldEmail;
        user.isActive = false;
        user.emailCandidate = newEmail;
        user.emailProofToken = token;
        user.emailProofTokenExpiresAt = new Date(Date.now() - 3600 * 1000);
        jest.spyOn(usersRepository, 'findOneOrFail').mockImplementation(() => {
          return Promise.resolve(user);
        });
        const saveSpy = jest.spyOn(usersRepository, 'save').mockImplementation(() => {
          return Promise.resolve(user);
        });
        expect(async () => {
          await usersService.confirmEmail(token);
        }).rejects;
        expect(saveSpy).not.toHaveBeenCalled();
      });

      it('throws when user is not found', () => {
        expect(async () => {
          await usersService.confirmEmail('anotherFakeToken');
        }).rejects;
      });
    });

    describe('updatePassword', () => {
      it('updates password if provided token is correct', async () => {
        const oldPassword = 'oldPassword';
        const oldPasswordHashed = await cryptoService.hash(oldPassword);
        const token = tokenService.generateToken();
        const user = new User();
        user.password = oldPasswordHashed;
        user.passwordResetToken = token;
        user.passwordResetTokenExpiresAt = new Date(Date.now() + 3600 * 1000);
        jest.spyOn(usersRepository, 'findOneOrFail').mockImplementation(() => {
          return Promise.resolve(user);
        });
        jest.spyOn(usersRepository, 'save').mockImplementation(data => {
          expect(data.password).not.toBe(oldPasswordHashed);
          expect(data.passwordResetTokenExpiresAt).toBe(null);
          expect(data.passwordResetToken).toBe(null);
          return Promise.resolve(user);
        });
        await usersService.updatePassword(token, 'newPassword');
      });

      it('throws when token is expired', async () => {
        const oldPassword = 'oldPassword';
        const oldPasswordHashed = await cryptoService.hash(oldPassword);
        const token = tokenService.generateToken();
        const user = new User();
        user.password = oldPasswordHashed;
        user.passwordResetToken = token;
        user.passwordResetTokenExpiresAt = new Date(Date.now() + 3600 * 1000);
        jest.spyOn(usersRepository, 'findOneOrFail').mockImplementation(() => {
          return Promise.resolve(user);
        });
        const saveSpy = jest.spyOn(usersRepository, 'save').mockImplementation(() => {
          return Promise.resolve(user);
        });
        expect(async () => {
          await usersService.updatePassword(token, '');
        }).rejects;
        expect(saveSpy).not.toHaveBeenCalled();
      });

      it('throws when user is not found', () => {
        expect(async () => {
          await usersService.updatePassword('anotherFakeToken', '');
        }).rejects;
      });
    });
  });
});
