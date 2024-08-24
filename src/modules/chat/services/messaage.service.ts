import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from '../entities';
import { ILike, Repository } from 'typeorm';
import { FilterMessageDto } from '../dtos/message/filter-message.dto';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  async findByRoomId(filterMessageDto: FilterMessageDto) {
    let { first = 0, rows = 20, filter = '', roomId } = filterMessageDto;

    try {
      const [result, total] = await this.messageRepository.findAndCount({
        where: { text: ILike(`%${filter}%`) },
        relations: { sender: true },
        order: { created_at: 'DESC' },
        take: rows,
        skip: first,
        select: {
          sender: {
            id: true,
            fullname: true,
            email: true,
          },
        },
      });

      return { result, total };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve messages for room ID ${roomId}: ${error.message}`,
        error.stack,
      );

      if (error instanceof NotFoundException) {
        throw new WsException(
          error.message || 'The requested resource was not found.',
        );
      }

      if (error instanceof WsException) {
        throw error;
      }

      throw new WsException(
        'An error occurred while fetching messages. Please try again later.',
      );
    }
  }
}
