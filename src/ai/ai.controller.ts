import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Roles } from '../common/decorators/roles';
import { AiService } from './ai.service';

@UseGuards(AuthGuard('jwt'))
@Roles('user', 'admin')
@UseInterceptors(new SentryInterceptor())
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('/start-worker')
  async startAiWorker(): Promise<string> {
    return await this.aiService.startWorker();
  }

  @Get('/stop-worker')
  async stopAiWorker(): Promise<string> {
    return await this.aiService.stopWorker();
  }

  // @Get('/status')
  // getStatus(): Promise<{ aiStatus: string; workerStatus: string }> {
  //   return this.aiService.aiStatus();
  // }
}
