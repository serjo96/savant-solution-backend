import { RolesEnum } from '@user/users.entity';

export interface JwtPayload {
  email: string;
  roles: RolesEnum;
}
