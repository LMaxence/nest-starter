import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from 'src/helpers/crypto/crypto.service';

@Injectable()
export class AuthService {
  constructor(
    private cryptoService: CryptoService,
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmailOrFail(email);
    if (await this.cryptoService.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      // eslint-disable-next-line camelcase
      access_token: this.jwtService.sign(payload),
    };
  }
}
