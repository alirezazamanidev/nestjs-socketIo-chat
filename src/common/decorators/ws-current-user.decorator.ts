import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { IUser } from 'src/modules/user/interfaces';

export const WsCurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): IUser => {
    const client: Socket = context.switchToWs().getClient<Socket>();
    return client.data.user;
  },
);
