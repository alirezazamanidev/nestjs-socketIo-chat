import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/payload.type';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  createJwtTokn(payload: JwtPayload) {
    try {
      let { JWT_SECRET_KEY } = process.env;
      return this.jwtService.sign(payload, {
        secret: JWT_SECRET_KEY,
        expiresIn: '7d',
      });
    } catch (error) {
        throw new InternalServerErrorException(error.message);
    }
  }
}
