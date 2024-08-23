import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmDBConfig } from './configs/typeOrm.config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmDBConfig,
      inject: [TypeOrmDBConfig],
    }),
    UserModule,
    AuthModule,
    ChatModule,
  ],
  providers: [TypeOrmDBConfig],
})
export class AppModule {}
