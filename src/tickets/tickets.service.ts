import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CLOCK, type Clock } from '../common/clock.js';
import { UsersService } from '../users/users.service.js';
import type { Priority, Ticket } from './ticket.model.js';
import { TicketsRepository } from './tickets.repository.js';

export interface CreateTicketInput {
  title: string;
  description?: string;
  priority: Priority;
  authorId: number;
  tags?: string[];
}

@Injectable()
export class TicketsService {
  constructor(
    private readonly repo: TicketsRepository,
    private readonly users: UsersService,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  findAll(
    filter?: Partial<Pick<Ticket, 'status' | 'authorId'>>,
  ): Promise<Ticket[]> {
    return this.repo.findAll(filter);
  }

  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.repo.findById(id);
    if (!ticket) {
      throw new NotFoundException(`Заявку з id=${id} не знайдено`);
    }
    return ticket;
  }

  async create(input: CreateTicketInput): Promise<Ticket> {
    const author = this.users.find(input.authorId);
    if (!author) {
      throw new UnprocessableEntityException(
        `Автора з id=${input.authorId} не знайдено`,
      );
    }

    const nowIso = this.clock.now().toISOString();
    return this.repo.create({
      title: input.title,
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      status: 'open',
      priority: input.priority,
      authorId: input.authorId,
      assigneeId: null,
      createdAt: nowIso,
      updatedAt: nowIso,
      tags: input.tags ? [...input.tags] : [],
    });
  }

  async remove(id: number): Promise<void> {
    const removed = await this.repo.remove(id);
    if (!removed) {
      throw new NotFoundException(`Заявку з id=${id} не знайдено`);
    }
  }
}
