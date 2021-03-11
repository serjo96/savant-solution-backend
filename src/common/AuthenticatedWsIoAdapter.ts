import { INestApplicationContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';

export class AuthenticatedSocketIoAdapter extends IoAdapter {
  private readonly jwtService: JwtService;
  constructor(private app: INestApplicationContext) {
    super(app);
    this.jwtService = this.app.get(JwtService);
  }

  createIOServer(port: number, options?: SocketIO.ServerOptions): any {
    options.allowRequest = async (request, allowFunction) => {
      console.log(request.headers);
      // const verified = token && (await this.jwtService.verify(token));
      if (true) {
        return allowFunction(null, true);
      }

      return allowFunction('Unauthorized', false);
    };

    return super.createIOServer(port, options);
  }
}
