import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import type { Ticket, TicketStatus } from './ticket.model.js';
import { type CreateTicketInput, TicketsService } from './tickets.service.js';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  findAll(
    @Query('status') status?: TicketStatus,
    @Query('authorId') authorId?: string,
  ): Promise<Ticket[]> {
    const filter: Partial<Pick<Ticket, 'status' | 'authorId'>> = {};
    if (status !== undefined) {
      filter.status = status;
    }
    if (authorId !== undefined && authorId !== '') {
      filter.authorId = Number(authorId);
    }
    return this.ticketsService.findAll(filter);
  }

  @Get(':ticketId')
  findOne(@Param('ticketId', ParseIntPipe) ticketId: number): Promise<Ticket> {
    return this.ticketsService.findOne(ticketId);
  }

  @Post()
  create(@Body() body: CreateTicketInput): Promise<Ticket> {
    return this.ticketsService.create(body);
  }

  @Delete(':ticketId')
  @HttpCode(204)
  async remove(
    @Param('ticketId', ParseIntPipe) ticketId: number,
  ): Promise<void> {
    await this.ticketsService.remove(ticketId);
  }
}
