import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity, RoomEntity } from '../entities';
import { DataSource, Repository } from 'typeorm';
import { EntityName } from 'src/common/enums';
import { RoomDetailDto } from '../dtos/room/room-detail.dto';
import { MessageService } from './messaage.service';
import { plainToInstance } from 'class-transformer';
import { WsException } from '@nestjs/websockets';
import { CreateRoomDto } from '../dtos/room/create-room.dto';
import { RoomParticipantsUserEntity } from '../entities/room-participants-user.entity';
import { AssignUsersDto } from '../dtos/room/assign-users.dto';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
    private readonly messssgeSerivce: MessageService,
    private readonly dataSourse: DataSource,
  ) {}

  async create(userId: string, createRoomDto: CreateRoomDto) {
    const { participants, ...RoomDetails } = createRoomDto;
    try {
      const newRoom = this.roomRepository.create({
        ...RoomDetails,
        createdBy: userId,
      });
      const savedRoom = await this.roomRepository.save(newRoom);

      if (participants && participants.length > 0) {
        participants.push(userId);

        await this.assignUsersToRoom(userId, {
          roomId: savedRoom.id,
          participants,
        });
      }
      this.logger.log(
        `Room with ID ${savedRoom.id} created successfully by User ID: ${userId}`,
      );
      return savedRoom;
    } catch (error) {
      this.logger.error(`Failed to create room: ${error.message}`, error.stack);
      throw new WsException('Error occurred while creating the room.');
    }
  }
  async findByUserId(userId: string) {
    try {
      const rooms = await this.roomRepository
        .createQueryBuilder(EntityName.Room)
        .leftJoinAndSelect(
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
  async findOne(userId: string, id: string) {
    try {
      const room = await this.roomRepository.findOne({
        where: { id },
        relations: {
          participants: {
            user: {
              connectedUsers: true,
            },
          },
        },
      });
      if (!room) {
        throw new WsException(`Room with ID "${id}" not found.`);
      }

      const isParticipnt = room.participants.some(
        (participant) => participant.userId === userId,
      );
      if (!isParticipnt)
        throw new WsException(
          `User with ID "${userId}" is not a participant of room with ID "${id}".`,
        );
      room.participants=room.participants.map((participant)=>participant.user);

    } catch (error) {}
  }
  private async assignUsersToRoom(
    userId: string,
    assignUsersDto: AssignUsersDto,
  ): Promise<void> {
    const queryRunner = this.dataSourse.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existingParticipants = await queryRunner.manager.find(
        RoomParticipantsUserEntity,
        {
          where: { roomId: assignUsersDto.roomId },
        },
      );
      const operationType =
        existingParticipants.length > 0 ? 're-assigned' : 'assigned';
      await queryRunner.manager.delete(RoomParticipantsUserEntity, {
        roomId: assignUsersDto.roomId,
      });

      const participantsToAssign = assignUsersDto.participants.map(
        (participantId) => ({
          roomId: assignUsersDto.roomId,
          userId: participantId,
          createdBy: userId,
          updatedBy: userId,
        }),
      );
      await queryRunner.manager.save(
        RoomParticipantsUserEntity,
        participantsToAssign,
      );

      this.logger.log(
        `Users ${operationType} to room ${assignUsersDto.roomId} successfully.`,
      );
      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.logger.error(
        `Failed to assign users to room: ${error.message}`,
        error.stack,
      );
      throw new WsException(
        `Failed to assign users to the room: ${error.message}`,
      );
    }
  }
}
