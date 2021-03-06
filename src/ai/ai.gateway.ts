import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JWTService } from '../auth/jwt.service';

@WebSocketGateway()
export class AiGateway {
  constructor(private readonly jwtService: JWTService) {}

  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('SocketIO');

  afterInit(server: Server) {
    this.logger.log('SocketIO init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
  // TODO: add socket.io adapter with token verification there
  async handleConnection(client: Socket) {
    try {
      this.jwtService.verifyToken(client.handshake.query.token);
      this.logger.log(`Client connected: ${client.id}`);
    } catch (e) {
      this.logger.error(
        `Socket disconnected within handleConnection() in AppGateway: ${e}`,
      );
      client.emit('authorization', { type: 'unauthorized' });
      client.disconnect(true);
    }
  }

  @SubscribeMessage('aiStatus')
  handleStatusMessage(payload: { status: string; workerStatus: string }): void {
    this.server.emit('aiStatus', payload);

    this.logger.log(`Send to client aiStatus: ${JSON.stringify(payload)}`);
  }

  handleWorkerMessage(payload: string): void {
    this.server.emit('aiWorkerStatus', payload);

    this.logger.log(
      `Send to client aiWorkerStatus: ${JSON.stringify(payload)}`,
    );
  }
}
