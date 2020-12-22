import { UserResponseDto } from '@user/dto/user-response.dto';
import { User } from '@user/users.entity';

export const toUserDto = (data: User): UserResponseDto => {
  const { id, name, email, roles, password } = data;
  const userDto: UserResponseDto = { id, name, email, roles, password };
  return userDto;
};
