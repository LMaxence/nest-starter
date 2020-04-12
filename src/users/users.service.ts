import { Injectable, Inject } from '@nestjs/common';
import { Repository, DeleteResult } from 'typeorm';
import { User } from './user.entity';
import { USERS_REPOSITORY, USERS_ENDPOINT } from './user.constants';
import { CreateUserDTO } from './dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { EmailService } from 'src/helpers/email/email.service';
import { ConfigService } from 'src/config/config.service';
import { TokenService } from 'src/helpers/token/token.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
    private tokenService: TokenService,
    private emailService: EmailService,
  ) {}

  /**
   * Create method
   * @param userObject
   */
  async create(userObject: CreateUserDTO): Promise<User> {
    return await this.usersRepository.save(
      this.usersRepository.create(userObject),
    );
  }

  /**
   * Get methods
   *
   */

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findById(id: string): Promise<User | undefined> {
    return await this.usersRepository.findOneOrFail({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOneOrFail({ where: { email } });
  }

  /**
   * Update methods
   *
   */

  async update(
    id: string,
    updateObject: UpdateUserDTO,
  ): Promise<User | undefined> {
    await this.usersRepository.update(id, updateObject);
    return await this.findById(id);
  }

  async requestEmailUpdate(id: string, emailCandidate: string) {
    const user = await this.findById(id);
    user.emailCandidate = emailCandidate;
    user.emailProofToken = this.tokenService.generateToken();
    this.usersRepository.save(user);
    this.emailService.sendMail({
      to: emailCandidate,
      subject: `Confirmation of your new email address for ${this.configService.get(
        'APP_NAME',
      )}`,
      html: `<a href="localhost:3000/${USERS_ENDPOINT}/${id}/email?token=${user.emailProofToken}">Confirm your new email</a>
      localhost:3000/${USERS_ENDPOINT}/${id}/email?token=${user.emailProofToken}`,
    });
  }

  async updateEmail(token: string) {
    const user = await this.usersRepository.findOneOrFail({
      where: { emailProofToken: token },
    });
    user.email = user.emailCandidate;
    user.emailProofToken = null;
    user.emailCandidate = null;
    this.usersRepository.save(user);
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
