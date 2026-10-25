import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import type { User } from './user.model.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): User[] {
    return this.usersService.findAll();
  }

  @Get(':userId')
  findOne(@Param('userId', ParseIntPipe) userId: number): User {
    return this.usersService.findOne(userId);
  }
}
