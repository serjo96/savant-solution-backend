import { CreateUserDto } from '@user/dto/create-user.dto';
import { User } from '@user/users.entity';

export class AuthServiceMock {
  register(userDto: CreateUserDto): CreateUserDto {
    const user: CreateUserDto = {
      password: '123456S!',
      email: 'testUser@ya.ru',
    };

    return user;
  }
}
