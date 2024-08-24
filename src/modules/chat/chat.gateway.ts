import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

import {
  Logger,
  UnauthorizedException,
  UseFilters,
  ValidationPipe,
} from '@nestjs/common';
import { WsExceptionFilter } from 'src/common/filters';
import { ConnectedUserService } from './services/connected-user.service';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../auth/types/payload.type';
import { JwtService } from '@nestjs/jwt';
import { RoomService } from './services/room.service';
import { log } from 'node:console';
import { WsCurrentUser } from 'src/common/decorators';
import { CreateRoomDto } from './dtos/room/create-room.dto';
import { RoomTypeEnum } from './enums/room-type.enum';
@UseFilters(WsExceptionFilter)
@WebSocketGateway(4800, { cors: { origin: '*' } })
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('ChatGateway');
  constructor(
    private readonly connectedUserService: ConnectedUserService,
    private readonly jwtService: JwtService,
    private readonly roomService: RoomService,
    
  ) {}
  async afterInit(server: any) {
    this.logger.log('ChatGateWay initialized!');
    await this.connectedUserService.deleteAll();
  }
  async handleConnection(socket: Socket): Promise<void> {
    try {
      const user = this.authenticateSocket(socket);

      await this.initializeUserConnection(user, socket);
    } catch (error) {
      this.handleConnectionError(socket, error);
    }
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    await this.connectedUserService.delete(socket.id);
    this.logger.log(`Client disconnected: ${socket.id}`);
  }
  @SubscribeMessage('createRoom')
  async createRoom(
    @WsCurrentUser() currentUser: JwtPayload,
    @MessageBody(new ValidationPipe()) createRoomDto: CreateRoomDto,
  ) {
    try {
      this.validateRoomTypeAndParticipants(
        createRoomDto.type,
        createRoomDto.participants,
        currentUser.userId,
      );
      
      const newRoom=await this.roomService.create(currentUser.userId,createRoomDto);
      // const createdRoomWithDetailes=await this.roomService.
    } catch (error) {}
  }

  async initializeUserConnection(userPayload: JwtPayload, socket: Socket) {
    socket.data.user = userPayload;

    await this.connectedUserService.create(userPayload.userId, socket.id);
    const rooms = await this.roomService.findByUserId(userPayload.userId);
    this.server.to(socket.id).emit('userAllRooms', rooms);
    this.logger.log(
      `Client connected: ${socket.id} - User ID: ${userPayload.userId}`,
    );
  }
  authenticateSocket(socket: Socket): JwtPayload {
    const token = this.extractJwtToken(socket);

    return this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET_KEY,
    });
  }
  private extractJwtToken(socket: Socket): string {
    const authHeader = socket.handshake.headers?.authorization;

    if (!authHeader)
      throw new UnauthorizedException('No authorization header found');

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'bearer' || !token)
      throw new UnauthorizedException('Invalid or missing token');

    return token;
  }

  private handleConnectionError(socket: Socket, error: Error): void {
    this.logger.error(
      `Connection error for socket ${socket.id}: ${error.message}`,
    );
    socket.emit('exception', 'Authentication error');
    socket.disconnect();
  }

  private validateRoomTypeAndParticipants(
    roomType: string,
    participants: string[],
    userId: string,
  ): void {
    if (participants.includes(userId)) {
      throw new WsException(
        'The room owner or updater should not be included in the participants list.',
      );
    }

    if (roomType === RoomTypeEnum.DIRECT && participants.length !== 1) {
      throw new WsException(
        'Direct chat must include exactly one participant aside from the room owner or updater.',
      );
    }

    if (roomType === RoomTypeEnum.GROUP && participants.length < 1) {
      throw new WsException(
        'Group chat must include at least one participant aside from the room owner or updater.',
      );
    }

    const uniqueParticipantIds = new Set(participants);
    if (uniqueParticipantIds.size !== participants.length) {
      throw new WsException('The participants list contains duplicates.');
    }
  }
}
