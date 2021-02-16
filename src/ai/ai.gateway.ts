import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class AiGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('SocketIO');

  afterInit(server: Server) {
    this.logger.log('SocketIO init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleStatusMessage(payload: {status: string}): void {
    this.server.emit('aiStatus', payload);

    this.logger.log(`Send to client message: ${JSON.stringify(payload)}`);
  }
}
