import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ControlPartsRequestBodyDto } from '@src/dtos/control-by-target-request-body.dto';

@WebSocketGateway({
  namespace: 'pi',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class PiGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger('PiGateway');

  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    this.logger.log(`Socket connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    this.logger.warn(`Pi disconnected: ${socket.id}`);
  }

  sendCommandToPi(action: ControlPartsRequestBodyDto) {
    this.server.emit('pi-command', action);
  }
}
