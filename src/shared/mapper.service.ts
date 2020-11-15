import { UserDto } from '@user/dto/user.dto';
import { User } from '@user/users.entity';

export const toUserDto = (data: User): UserDto => {
  const { id, email, roles } = data;
  const userDto: UserDto = { id, email, roles };
  return userDto;
};
