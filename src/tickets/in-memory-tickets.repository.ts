import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import type { Ticket } from './ticket.model.js';
import { TicketsRepository } from './tickets.repository.js';
import { TICKETS_SEED } from './tickets.seed.js';

@Injectable()
export class InMemoryTicketsRepository
  extends TicketsRepository
  implements OnModuleInit
{
  private readonly logger = new Logger(InMemoryTicketsRepository.name);
  private items: Ticket[] = [];
  private nextId = 1;

  onModuleInit(): void {
    this.items = TICKETS_SEED.map((t) => ({ ...t, tags: [...t.tags] }));
    this.nextId = Math.max(0, ...this.items.map((t) => t.id)) + 1;
    this.logger.log(`Завантажено заявок: ${this.items.length}`);
  }

  private clone(ticket: Ticket): Ticket {
    return { ...ticket, tags: [...ticket.tags] };
  }

  async findAll(
    filter?: Partial<Pick<Ticket, 'status' | 'authorId'>>,
  ): Promise<Ticket[]> {
    return this.items
      .filter((t) => {
        if (filter?.status !== undefined && t.status !== filter.status) {
          return false;
        }
        if (filter?.authorId !== undefined && t.authorId !== filter.authorId) {
          return false;
        }
        return true;
      })
      .map((t) => this.clone(t));
  }

  async findById(id: number): Promise<Ticket | undefined> {
    const found = this.items.find((t) => t.id === id);
    return found ? this.clone(found) : undefined;
  }

  async create(data: Omit<Ticket, 'id'>): Promise<Ticket> {
    const created: Ticket = {
      id: this.nextId++,
      ...data,
      tags: [...data.tags],
    };
    this.items.push(created);
    return this.clone(created);
  }

  async remove(id: number): Promise<boolean> {
    const index = this.items.findIndex((t) => t.id === id);
    if (index === -1) {
      return false;
    }
    this.items.splice(index, 1);
    return true;
  }
}
