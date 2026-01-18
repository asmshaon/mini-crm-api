import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const session = request.cookies['session'];

    if (!session) {
      throw new UnauthorizedException('Unauthorized. Please login to continue.');
    }

    return true;
  }
}
