import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UsersService } from './users.service.js';

describe('UsersService (модульні тести)', () => {
  let service: UsersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();
    service = moduleRef.get(UsersService);
  });

  it('findAll: повертає 3 користувачів з початкових даних і захищає стан від мутацій', () => {
    const all = service.findAll();
    expect(all).toHaveLength(3);
    expect(all[0]).toMatchObject({ id: 1, role: 'student' });

    all[0]!.fullName = 'Змінене Ім’я';
    expect(service.findAll()[0]!.fullName).toBe('Петренко Андрій Іванович');
  });

  it('find: повертає користувача за існуючим id та undefined для неіснуючого', () => {
    expect(service.find(2)).toMatchObject({
      id: 2,
      fullName: 'Коваль Марія Олегівна',
      role: 'teacher',
    });
    expect(service.find(999)).toBeUndefined();
  });

  it('findOne: повертає користувача за існуючим id', () => {
    const admin = service.findOne(3);
    expect(admin).toMatchObject({
      id: 3,
      fullName: 'Шевчук Олег Петрович',
      role: 'admin',
    });
  });

  it('findOne: кидає NotFoundException для неіснуючого id', () => {
    expect(() => service.findOne(99)).toThrow(NotFoundException);
  });
});
