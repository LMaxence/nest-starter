import { Module } from '@nestjs/common';
import { NotFoundFilter } from './not-found.filter';

@Module({
  providers: [NotFoundFilter],
  exports: [NotFoundFilter],
})
export class FiltersModule {}
