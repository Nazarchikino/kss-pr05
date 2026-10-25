import { Module } from '@nestjs/common';
import { CLOCK, systemClock } from '../common/clock.js';
import { UsersModule } from '../users/users.module.js';
import { EmptyTicketsRepository } from './empty-tickets.repository.js';
import { InMemoryTicketsRepository } from './in-memory-tickets.repository.js';
import { TicketsController } from './tickets.controller.js';
import { TicketsRepository } from './tickets.repository.js';
import { TicketsService } from './tickets.service.js';

export function ticketsRepositoryFactory(): TicketsRepository {
  return process.env.TICKETS_STORAGE === 'empty'
    ? new EmptyTicketsRepository()
    : new InMemoryTicketsRepository();
}

@Module({
  imports: [UsersModule],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    { provide: TicketsRepository, useFactory: ticketsRepositoryFactory },
    { provide: CLOCK, useValue: systemClock },
  ],
})
export class TicketsModule {}
