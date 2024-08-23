import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';

@Module({

    imports:[UserModule,JwtModule.register({global:true})],
    providers:[AuthService,TokenService],
    controllers:[AuthController]
})
export class AuthModule {}
