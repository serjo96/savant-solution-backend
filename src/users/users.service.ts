import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { toUserDto } from '@shared/mapper.service';
import { Repository } from 'typeorm';

import { BadRequestException } from '../common/exceptions/bad-request';

import { CreateUserDto } from './dto/create-user.dto';
import { Profile } from './profiles.entity';
import { UserDto } from './dto/user.dto';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
  ) {}

  findAll(where: any): Promise<User[]> {
    return this.usersRepository.find(where);
  }

  findOne(where: any): Promise<User | undefined> {
    return this.usersRepository.findOne(where);
  }

  async create(userDto: Partial<CreateUserDto>): Promise<UserDto | undefined> {
    const { password, email } = userDto;

    const userInDb = await this.usersRepository.findOne({
      where: { email },
    });

    if (userInDb) {
      throw new BadRequestException('User already exists');
    }

    const user: User = await this.usersRepository.create({
      password,
      email,
    });
    await this.usersRepository.save(user);
    return toUserDto(user);
  }

  async saveProfile(user: User, data: Partial<Profile>): Promise<any> {
    const { ...rest } = data;

    let profile = await this.getProfile({
      select: [
        'id',
        'createdAt',
        'deletedAt',
        'name',
        'email',
        'userId',
      ],
      where: {
        userId: user.id,
      },
    });

    if (!profile) {
      profile = Profile.create({
        userId: user.id,
        ...data,
      });
    } else {
      profile.name = data.name;
    }

    return this.profilesRepository.save(profile);
  }

  getProfile(where: any): Promise<Profile | undefined> {
    return this.profilesRepository.findOne(where);
  }
}
