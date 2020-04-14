import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenService {
  ttl = 3600 * 1000;
  generateToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
