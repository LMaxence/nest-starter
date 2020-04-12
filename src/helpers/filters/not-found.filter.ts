import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { Response } from 'express';

export const ENTITY_NOT_FOUND_ERROR_MESSAGE = 'No entity found';

@Catch(EntityNotFoundError)
export class NotFoundFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(404).json({
      error: ENTITY_NOT_FOUND_ERROR_MESSAGE,
    });
  }
}
