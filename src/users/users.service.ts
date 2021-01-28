import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { toUserDto } from '@shared/mapper.service';
import * as bcrypt from 'bcrypt';
import { FindOneOptions, Repository } from 'typeorm';

import { BadRequestException } from '../common/exceptions/bad-request';

import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
  }

  findAll(where: any): Promise<User[]> {
    return this.userRepository.find(where);
  }

  findOne(where: any): Promise<User | undefined> {
    return this.userRepository.findOne(where);
  }

  public async findById(
    id: string,
    opts?: FindOneOptions<User>,
  ): Promise<User | null> {
    return await this.userRepository.findOneOrFail(id, opts);
  }

  public async findByEmail(userEmail: string): Promise<User | null> {
    return await this.userRepository.findOne({ email: userEmail });
  }

  async create(
    userDto: Partial<CreateUserDto>,
  ): Promise<UserResponseDto | undefined> {
    const { password, email, name } = userDto;

    const userInDb = await this.userRepository.findOne({
      where: { email },
    });

    if (userInDb) {
      throw new HttpException(`User already exists`, HttpStatus.OK);
    }

    const user: User = await this.userRepository.create({
      password,
      email,
      name,
    });
    await this.userRepository.save(user);
    return toUserDto(user);
  }

  async editUser(id: string, data: any) {
    const toUpdate = await this.userRepository.findOne(id);

    if (!toUpdate) {
      throw new HttpException(`User doesn't exists`, HttpStatus.OK);
    }
    try {
      const updated: any = Object.assign(toUpdate, data);
      return this.userRepository.save(updated);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async removeUser(id) {
    return await this.userRepository.softDelete({ id });
  }
}
