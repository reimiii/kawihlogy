/* eslint-disable */
import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Namespace, Server, Socket } from 'socket.io';
import { JoinRoomPoemDto } from './dto/join-room-poem.dto';

@WebSocketGateway({
  namespace: 'poem',
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket'],
})
export class PoemGateway {
  private readonly logger = new Logger(PoemGateway.name);

  @WebSocketServer()
  server: Server;

  @WebSocketServer()
  namespace: Namespace;

  @SubscribeMessage('poem:join')
  async handelJoinRoom(
    @MessageBody() data: JoinRoomPoemDto,
    @ConnectedSocket() client: Socket,
  ): Promise<WsResponse<{ type: string }>> {
    this.logger.log(`Joining room for job ID: ${data.jobId}`);

    client.join(data.jobId);

    return {
      event: data.jobId,
      data: {
        type: 'joined',
      },
    };
  }
}
