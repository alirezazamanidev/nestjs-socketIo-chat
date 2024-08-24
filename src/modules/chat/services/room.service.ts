import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { MessageEntity, RoomEntity } from '../entities';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { EntityName } from 'src/common/enums';
import { RoomDetailDto } from '../dtos/room/room-detail.dto';
import { MessageService } from './messaage.service';
import { plainToInstance } from 'class-transformer';
import { WsException } from '@nestjs/websockets';
import { CreateRoomDto } from '../dtos/room/create-room.dto';

import { AssignUsersDto } from '../dtos/room/assign-users.dto';
import { RoomParticipantsUserEntity } from '../entities/room-participants-user';
import { sanitizeUser } from 'src/common/utility/sanitizeUser.util';
import { UserEntity } from 'src/modules/user/entities/user.entity';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
    private readonly messssgeSerivce: MessageService,
    @InjectDataSource() private dataSource: DataSource,
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
  async findOne(userId: string, id: string) {
    try {
      const room = await this.roomRepository.findOne({
        where: { id },
        relations: ['participants', 'participants.connectedUsers', 'messages'],
      });
      if (!room) {
        throw new WsException(`Room with ID "${id}" not found.`);
      }

      const isParticipnt = room.participants.some(
        (participant) => participant.id === userId,
      );
      if (!isParticipnt)
        throw new WsException(
          `User with ID "${userId}" is not a participant of room with ID "${id}".`,
        );
      room.participants = room.participants.map((participant) =>
        sanitizeUser(participant),
      );
     
      return room;
    } catch (error) {
      this.logger.error(
        `Failed to find room with ID ${id} for user ID ${userId}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while retrieving the room.');
    }
  }
  private async assignUsersToRoom(
    userId: string,
    assignUsersDto: AssignUsersDto,
  ): Promise<void> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingParticipants = await queryRunner.query(
        `SELECT * FROM "roomParticipantsUser" WHERE "roomId" = $1`,
        [assignUsersDto.roomId],
      );

      const operationType =
        existingParticipants.length > 0 ? 're-assigned' : 'assigned';
      await queryRunner.query(
        `DELETE FROM "roomParticipantsUser" WHERE "roomId" = $1`,
        [assignUsersDto.roomId],
      );

      // اضافه کردن شرکت کنندگان جدید
      const participantsToAssign = assignUsersDto.participants.map(
        (participantId) => ({
          roomId: assignUsersDto.roomId,
          userId: participantId,
          createdBy: userId,
          updatedBy: userId,
        }),
      );

      const insertPromises = participantsToAssign.map((participant) =>
        queryRunner.query(
          `INSERT INTO "roomParticipantsUser" ("roomId", "userId") VALUES ($1, $2)`,
          [participant.roomId, participant.userId],
        ),
      );

      await Promise.all(insertPromises);
      await queryRunner.commitTransaction();

      this.logger.log(
        `Users ${operationType} to room ${assignUsersDto.roomId} successfully.`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to assign users to room: ${error.message}`,
        error.stack,
      );
      throw new WsException(
        `Failed to assign users to the room: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
