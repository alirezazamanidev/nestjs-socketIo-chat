import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity, RoomEntity } from '../entities';
import { Repository } from 'typeorm';
import { EntityName } from 'src/common/enums';
import { RoomDetailDto } from '../dtos/room/room-detail.dto';
import { MessageService } from './messaage.service';
import { plainToInstance } from 'class-transformer';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
    private readonly messssgeSerivce: MessageService,
  ) {}

  async findByUserId(userId: string) {
    try {
      const rooms = await this.roomRepository
        .createQueryBuilder(EntityName.Room)
        .innerJoin(
          'room.participants',
          'participant',
          'participant.id = :userId',
          { userId },
        )
        .leftJoinAndSelect('room.participants', 'allParticipants')
        .getMany();
    
        
      const roomDetailsList: RoomDetailDto[] = [];
      for (const room of rooms) {
        const lastMessageResult = await this.messssgeSerivce.findByRoomId({
          roomId: room.id,
          first: 0,
          rows: 1,
        });
        const roomDetail = plainToInstance(RoomDetailDto, {
          ...room,
          lastMessage: lastMessageResult.total
            ? lastMessageResult.result[0]
            : null,
        });
        roomDetailsList.push(roomDetail);
      }
      return roomDetailsList;
    } catch (error) {
      this.logger.error(
        `Failed to find rooms for user ID ${userId}: ${error.message}`,
        { userId, errorStack: error.stack },
      );
      throw new WsException(
        'An error occurred while retrieving user rooms. Please try again later.',
      );
    }
  }
}
