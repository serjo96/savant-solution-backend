import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { GraingerAccountsService } from './grainger-accounts.service';
import { ValidationPipe } from '../common/Pipes/validation.pipe';
import { CreateGraingerAccountDto } from './dto/create-grainger-account.dto';
import { GetGraingerAccountDto } from './dto/get-grainger-account.dto';
import { TransformInterceptor } from '../common/interceptors/TransformInterceptor';
import { AiService } from '../ai/ai.service';

@Controller('grainger-accounts')
export class GraingerAccountsController {
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
    const result = await this.aiService.addAccount(account);
    console.log(result);
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
  delete(@Param() { id }: { id: string }): Promise<any> {
    return this.service.deleteById(id);
  }
}
