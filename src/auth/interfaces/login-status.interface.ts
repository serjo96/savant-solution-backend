import { UserResponseDto } from '../dto/user.dto';

export class LoginStatus {
  user: UserResponseDto;
  token: {
    accessToken: string;
    expiresIn: string;
  };
}
