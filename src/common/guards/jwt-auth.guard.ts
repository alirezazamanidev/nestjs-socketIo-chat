import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AuthMesssge } from '../enums';
import { JwtService } from '@nestjs/jwt';

export class JWTAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('bearer '))
      throw new UnauthorizedException(AuthMesssge.TokenNotFounded);
    const token = authHeader.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
      request.user={id:decoded.id};
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
