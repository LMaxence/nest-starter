import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { USERS_REPOSITORY } from './user.constants';
import { CreateUserDTO } from './dto';
import { UpdateUserDTO } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private usersRepository: Repository<User>,
  ) {}

  async create(userObject: CreateUserDTO) {
    return this.usersRepository.create(userObject);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(
    id: string,
    updateObject: UpdateUserDTO,
  ): Promise<User | undefined> {
    await this.usersRepository.update(id, updateObject);
    return this.usersRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    this.usersRepository.delete(id);
    return;
  }
}
