import { UserClassResponseDto } from '../dto/user.dto';

export class UserWithToken {
  user: UserClassResponseDto;
  token: {
    accessToken: string;
    expiresIn: string;
  };
}
