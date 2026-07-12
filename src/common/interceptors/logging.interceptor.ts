import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const correlationId = randomUUID();
    req.correlationId = correlationId;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`[${correlationId}] ${method} ${url} ${Date.now() - now}ms`);
      }),
    );
  }
}
