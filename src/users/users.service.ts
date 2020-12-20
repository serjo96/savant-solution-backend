import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { toUserDto } from '@shared/mapper.service';
import { FindOneOptions, Repository } from 'typeorm';

import { BadRequestException } from '../common/exceptions/bad-request';

import { CreateUserDto } from './dto/create-user.dto';
import { Profile } from './profiles.entity';
import { UserDto } from './dto/user.dto';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
  ) {}

  findAll(where: any): Promise<User[]> {
    return this.userRepository.find(where);
  }

  findOne(where: any): Promise<User | undefined> {
    return this.userRepository.findOne(where);
  }

  public async findById(id: string, opts?:FindOneOptions<User> ): Promise<User | null> {
    return await this.userRepository.findOneOrFail(id, opts);
  }

  public async findByEmail(userEmail: string): Promise<User | null> {
    return await this.userRepository.findOne({ email: userEmail });
  }

  async create(userDto: Partial<CreateUserDto>): Promise<UserDto | undefined> {
    const { password, email } = userDto;

    const userInDb = await this.userRepository.findOne({
      where: { email },
    });

    if (userInDb) {
      throw new BadRequestException('User already exists');
    }

    const user: User = await this.userRepository.create({
      password,
      email,
    });
    await this.userRepository.save(user);
    return toUserDto(user);
  }

  async saveProfile(user: User, data: Partial<Profile>): Promise<any> {
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
      profile = Profile.create(data);
    } else {
      profile.name = data.name;
    }

    return this.profilesRepository.save(profile);
  }

  getProfile(where: any): Promise<Profile | undefined> {
    return this.profilesRepository.findOne(where);
  }

  async removeUser(id) {
    return await this.userRepository.softDelete({id});
  }

  async removeProfile(id) {
    return await this.userRepository.softDelete({id});
  }

}
