import { User } from '@user/users.entity';

export class UsersServiceMock {
  findAll(where: any): any[] {
    return [];
  }

  findOne(where: any): any {
    return {
      id: 1,
      email: 'test@admin.com',
    };
  }

  create({ email, password }: { email: string; password: string }): any {
    return {
      id: '12323',
      createdAt: '2021-01-14T19:27:38.488Z',
      updatedAt: '2021-01-14T19:27:38.488Z',
      deletedAt: null,
      email: 'use2@yandex.ru',
      name: null,
      roles: 'USER',
      settings: null,
    };
  }

  save(emailDto) {
    const email: Partial<User> = {
      id: '123',
      email: 'testUser@ya.ru',
      createdAt: new Date(),
      deletedAt: null,
      updatedAt: null,
    };

    return email;
  }
}
