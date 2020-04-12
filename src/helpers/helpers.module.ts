import { Module } from '@nestjs/common';
import { NotFoundFilter } from './filters/not-found.filter';
import { EmailModule } from './email/email.module';
import { EmailService } from './email/email.service';
import { FiltersModule } from './filters/filters.module';
import { StringModule } from './token/token.module';
import { TokenService } from './token/token.service';

@Module({
  imports: [EmailModule, FiltersModule, StringModule],
  providers: [NotFoundFilter, EmailService, TokenService],
  exports: [NotFoundFilter, EmailService, TokenService],
})
export class HelpersModule {}
