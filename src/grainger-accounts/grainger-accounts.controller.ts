import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
} from '@nestjs/common';
import { GraingerAccountsService } from './grainger-accounts.service';
import { ValidationPipe } from '../common/Pipes/validation.pipe';
import { CreateGraingerAccountDto } from './dto/create-grainger-account.dto';

@Controller('grainger-accounts')
export class GraingerAccountsController {
  constructor(private readonly service: GraingerAccountsService) {}

  @Get()
  @UsePipes(new ValidationPipe())
  getAll(): Promise<any> {
    return this.service.getAll();
  }

  @Get(':id')
  @UsePipes(new ValidationPipe())
  getById(@Param() { id }: { id: string }): Promise<any> {
    return this.service.getById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  add(@Body() item: CreateGraingerAccountDto): Promise<any> {
    return this.service.add(item);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  editById(@Param() { id }: { id: string }, @Body() item: any): Promise<any> {
    return this.service.editById(id, item);
  }

  @Delete(':id')
  @UsePipes(new ValidationPipe())
  delete(@Param() { id }: { id: string }): Promise<any> {
    return this.service.deleteById(id);
  }
}
