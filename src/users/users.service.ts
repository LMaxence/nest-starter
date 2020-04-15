import { Injectable, Inject, ImATeapotException } from '@nestjs/common';
import { Repository, DeleteResult, DeepPartial } from 'typeorm';
import { User } from './user.entity';
import { USERS_REPOSITORY, USERS_ENDPOINT, USER_PASSWORD_RESET_EMAIL_SUBJECT, USER_EMAIL_CONFIRM_EMAIL_SUBJECT } from './user.constants';
import { CreateUserDTO } from './dto';
import { EmailService } from 'src/helpers/email/email.service';
import { ConfigService } from 'src/config/config.service';
import { TokenService } from 'src/helpers/token/token.service';
import { CryptoService } from 'src/helpers/crypto/crypto.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
    private cryptoService: CryptoService,
    private tokenService: TokenService,
    private emailService: EmailService
  ) {}

  /**
   * Create method
   * @param userObject
   */
  async create(userObject: CreateUserDTO): Promise<User> {
    userObject.password = await this.cryptoService.hash(userObject.password);
    const user = await this.usersRepository.save(
      this.usersRepository.create({
        ...userObject,
      })
    );
    await this.requestEmailConfirmation(user.id.toString(), user.email);
    return user;
  }

  /**
   * Get methods
   *
   */

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findById(id: string): Promise<User | undefined> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByIdOrFail(id: string): Promise<User> {
    return await this.usersRepository.findOneOrFail({ where: { id } });
  }

  async findByEmailOrFail(email: string): Promise<User> {
    return this.usersRepository.findOneOrFail({ where: { email } });
  }

  async getEmailAvailability(email: string): Promise<boolean> {
    if (await this.findByEmail(email)) {
      return false;
    }
    return true;
  }

  /**
   * Update methods
   *
   */

  async update(id: string, updateObject: DeepPartial<User>): Promise<User> {
    await this.usersRepository.update(id, updateObject);
    return await this.findByIdOrFail(id);
  }

  async requestEmailConfirmation(id: string, emailCandidate: string): Promise<void> {
    const user = await this.findByIdOrFail(id);
    user.emailCandidate = emailCandidate;
    user.emailProofToken = this.tokenService.generateToken();
    user.emailProofTokenExpiresAt = new Date(Date.now() + this.tokenService.ttl);
    const url = `${this.configService.get('BASE_URL')}/${USERS_ENDPOINT}/email/confirm?token=${user.emailProofToken}`;
    await this.usersRepository.save(user);
    this.emailService.sendMail(
      {
        to: user.emailCandidate,
        subject: USER_EMAIL_CONFIRM_EMAIL_SUBJECT,
      },
      'confirm-email.ejs',
      { url }
    );
  }

  async requestPasswordUpdate(email: string) {
    const user = await this.findByEmailOrFail(email);
    user.passwordResetToken = this.tokenService.generateToken();
    user.passwordResetTokenExpiresAt = new Date(Date.now() + this.tokenService.ttl);
    const url = `${this.configService.get('BASE_URL')}/${USERS_ENDPOINT}/password/reset?token=${user.passwordResetToken}`;
    await this.usersRepository.save(user);
    this.emailService.sendMail(
      {
        to: user.email,
        subject: USER_PASSWORD_RESET_EMAIL_SUBJECT,
      },
      'reset-password.ejs',
      { url }
    );
  }

  async confirmEmail(token: string) {
    const user = await this.usersRepository.findOneOrFail({
      where: { emailProofToken: token },
    });

    if (user.emailProofTokenExpiresAt.getTime() < Date.now()) {
      await this.requestEmailConfirmation(user.id.toString(), user.email);
      throw new ImATeapotException('Your token is expired, we sent you a new one');
    }
    user.email = user.emailCandidate;
    user.isActive = true;
    user.emailProofToken = null;
    user.emailProofTokenExpiresAt = null;
    user.emailCandidate = null;
    await this.usersRepository.save(user);
  }

  async updatePassword(token: string, password: string) {
    const user = await this.usersRepository.findOneOrFail({
      where: { passwordResetToken: token },
    });
    if (user.passwordResetTokenExpiresAt.getTime() < Date.now()) {
      await this.requestPasswordUpdate(user.email);
      throw new ImATeapotException('Your token is expired, we sent you a new one');
    }
    user.password = await this.cryptoService.hash(password);
    user.passwordResetToken = null;
    user.passwordResetTokenExpiresAt = null;
    await this.usersRepository.save(user);
  }

  async updatePasswordWithoutToken(id: string, password: string) {
    const user = await this.usersRepository.findOneOrFail(id);
    user.password = await this.cryptoService.hash(password);
    user.passwordResetToken = null;
    user.passwordResetTokenExpiresAt = null;
    await this.usersRepository.save(user);
  }

  /**
   * Delete methods
   *
   */

  async delete(id: string): Promise<DeleteResult> {
    await this.usersRepository.findOneOrFail(id);
    return this.usersRepository.delete(id);
  }
}
