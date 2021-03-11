import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GraingerAccountsService } from './grainger-accounts.service';
import { ValidationPipe } from '../common/Pipes/validation.pipe';
import { CreateGraingerAccountDto } from './dto/create-grainger-account.dto';
import { GetGraingerAccountDto } from './dto/get-grainger-account.dto';
import { TransformInterceptor } from '../common/interceptors/TransformInterceptor';
import { AiService } from '../ai/ai.service';

@UseGuards(AuthGuard('jwt'))
@Controller('grainger-accounts')
export class GraingerAccountsController {
  private readonly logger = new Logger(GraingerAccountsController.name);

  constructor(
    private readonly service: GraingerAccountsService,
    private aiService: AiService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(GetGraingerAccountDto))
  getAll(): Promise<GetGraingerAccountDto[]> {
    return this.service.getAll();
  }

  @Get(':id')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(GetGraingerAccountDto))
  getById(@Param() { id }: { id: string }): Promise<GetGraingerAccountDto> {
    return this.service.getById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(GetGraingerAccountDto))
  async add(
    @Body() item: CreateGraingerAccountDto,
  ): Promise<GetGraingerAccountDto> {
    const account = await this.service.add(item);
    try {
      const { error } = await this.aiService.addAccount(account);
      if (error) {
        throw new Error(`[AI Service] ${error.message}`);
      }
      this.logger.debug(
        `[Add Grainger Account] Account ${account.id} went successfully to AI`,
      );
    } catch ({ message }) {
      await this.service.deleteById(account.id);
      const error = `[Add Grainger Account] ${message}`;
      this.logger.debug(error);
      throw new HttpException(error, HttpStatus.OK);
    }
    return account;
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(GetGraingerAccountDto))
  editById(
    @Param() { id }: { id: string },
    @Body() item: CreateGraingerAccountDto,
  ): Promise<GetGraingerAccountDto> {
    return this.service.editById(id, item);
  }

  @Delete(':id')
  @UsePipes(new ValidationPipe())
  async delete(@Param() { id }: { id: string }): Promise<any> {
    const account = await this.service.deleteById(id);
    try {
      const { error } = await this.aiService.deleteAccount({ id });
      if (error) {
        throw new Error(`[AI Service] ${error.message}`);
      }
      this.logger.debug(
        `[Delete Grainger Account] Account ${id} deleted successfully from AI`,
      );
    } catch ({ message }) {
      const error = `[Delete Grainger Account] ${message}`;
      this.logger.debug(error);
      throw new HttpException(error, HttpStatus.OK);
    }
    return account;
  }
}
