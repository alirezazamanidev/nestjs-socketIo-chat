import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ConnectedUserEntity, MessageEntity, RoomEntity } from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectedUserService } from './services/connected-user.service';
import { RoomService } from './services/room.service';
import { MessageService } from './services/messaage.service';

@Module({
  imports:[TypeOrmModule.forFeature([ConnectedUserEntity,RoomEntity,MessageEntity])],
  providers: [ChatGateway, ConnectedUserService,RoomService,MessageService],
})
export class ChatModule {}
