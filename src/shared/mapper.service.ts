import { UserDto } from '@user/dto/user.dto';
import { User } from '@user/users.entity';

export const toUserDto = (data: User): UserDto => {
  const { id, email, confirmed, roles } = data;
  const userDto: UserDto = { id, email, confirmed, roles };
  return userDto;
};
