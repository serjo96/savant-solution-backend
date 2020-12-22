import { RolesEnum, User } from '@user/users.entity';

export class UserClassResponseDto {
  constructor(object: User) {
    this.id = object.id;
    this.email = object.email;
    this.roles = RolesEnum[object.roles];
  }
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly roles: string;
}
