import { RolesEnum } from '@user/users.entity';

export interface JwtPayload {
  id: string;
  email: string;
  roles: RolesEnum;
}
