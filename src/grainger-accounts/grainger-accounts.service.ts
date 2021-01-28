import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GraingerAccount } from './grainger-account.entity';
import { CreateGraingerAccountDto } from './dto/create-grainger-account.dto';

@Injectable()
export class GraingerAccountsService {
  constructor(
    @InjectRepository(GraingerAccount)
    private readonly repository: Repository<GraingerAccount>,
  ) {
  }

  getAll(): Promise<GraingerAccount[]> {
    return this.repository.find();
  }

  getById(id: string, where?: any): Promise<GraingerAccount> {
    return this.repository.findOne(id, { ...where });
  }

  async add(accountDto: CreateGraingerAccountDto): Promise<GraingerAccount> {
    const accountWithLogin = await this.repository.findOne({
      where: { email: accountDto.email },
    });
    if (accountWithLogin) {
      throw new HttpException(
        'Grainger Account with same login already exists',
        HttpStatus.OK,
      );
    }

    return this.repository.save(GraingerAccount.create(accountDto));
  }

  async editById(id: string, dto: any): Promise<GraingerAccount> {
    const accountWithLogin = await this.repository.findOne({
      where: { email: dto.login },
    });
    if (accountWithLogin) {
      throw new HttpException(
        'Grainger Account with same login already exists',
        HttpStatus.OK,
      );
    }

    const account = await this.getById(id);
    if (!account) {
      throw new HttpException(`Grainger Account doesn't exist`, HttpStatus.OK);
    }

    const updated = Object.assign(account, dto);
    return this.repository.save(updated);
  }

  async deleteById(id: string) {
    const account = await this.getById(id, { relations: ['items'] });
    if (!account) {
      throw new HttpException(`Grainger Account doesn't exist`, HttpStatus.OK);
    }
    if (account.items?.length) {
      throw new HttpException(`Grainger Account already have items`, HttpStatus.OK);
    }
    return this.repository.delete(id);
  }
}
