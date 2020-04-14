import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  saltRounds = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds).then((hash) => hash);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash).then((result) => result);
  }
}
