import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SensorDataDto } from '@src/dtos/sensor-data.dto';

@WebSocketGateway({
  namespace: 'frontend',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class FrontendGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger('FrontendGateway');

  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    this.logger.log(`Socket connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    this.logger.warn(`Frontend disconnected: ${socket.id}`);
  }

  sensorUpdate(sensorData: SensorDataDto) {
    this.logger.log(`Sensor update: ${JSON.stringify(sensorData)}`);
    this.server.emit('sensor-update', sensorData);
  }
}
