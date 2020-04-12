import { Module } from '@nestjs/common';
import { NotFoundFilter } from './filters/not-found.filter';
import { EmailModule } from './email/email.module';
import { EmailService } from './email/email.service';
import { FiltersModule } from './filters/filters.module';
import { StringModule } from './token/token.module';
import { TokenService } from './token/token.service';
import { CryptoModule } from './crypto/crypto.module';
import { CryptoService } from './crypto/crypto.service';

@Module({
  imports: [EmailModule, FiltersModule, StringModule, CryptoModule],
  providers: [NotFoundFilter, EmailService, TokenService, CryptoService],
  exports: [NotFoundFilter, EmailService, TokenService, CryptoService],
})
export class HelpersModule {}
