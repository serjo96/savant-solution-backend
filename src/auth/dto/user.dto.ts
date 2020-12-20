import { RolesEnum, User } from '@user/users.entity';

export class UserClassResponseDto {
  constructor(object: User) {
    this.id = object.id;
    this.email = object.email;
    this.roles = RolesEnum[object.roles];
    if (object.profile) {
      this.name = object.profile.name;
      this.photoURL = object.profile.photoURL;
    }
  }
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly photoURL: string;
  readonly roles: string;
}
