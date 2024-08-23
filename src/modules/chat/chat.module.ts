import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ConnectedUserEntity } from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([ConnectedUserEntity])],
  providers: [ChatGateway, ConnectedUserEntity],
})
export class ChatModule {}
