import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Logger, UnauthorizedException, UseFilters } from '@nestjs/common';
import { WsExceptionFilter } from 'src/common/filters';
import { ConnectedUserService } from './services/connected-user.service';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../auth/types/payload.type';
import { JwtService } from '@nestjs/jwt';
import { RoomService } from './services/room.service';
import { log } from 'node:console';
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
    private readonly roomService:RoomService
  ) {}
  async afterInit(server: any) {
    this.logger.log('ChatGateWay initialized!');
    await this.connectedUserService.deleteAll();
  }
  async handleConnection(socket: Socket): Promise<void> {
    try {
   
      const user = this.authenticateSocket(socket);

      
      await this.initializeUserConnection(user,socket);
    } catch (error) {
      this.handleConnectionError(socket,error);
    }
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    await this.connectedUserService.delete(socket.id);
    this.logger.log(`Client disconnected: ${socket.id}`);
  }

  async initializeUserConnection(userPayload:JwtPayload,socket:Socket){
    socket.data.user=userPayload;
   
    await this.connectedUserService.create(userPayload.userId,socket.id);
    const rooms=await this.roomService.findByUserId(userPayload.userId);
    this.server.to(socket.id).emit('userAllRooms',rooms);
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

}
