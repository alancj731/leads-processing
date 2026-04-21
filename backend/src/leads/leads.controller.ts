import { Controller, Post, Body } from '@nestjs/common';
import { LeadsService } from './leads.service.js';
import { DedupLeadsDto } from './dto/dedup-leads.dto.js';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post('deduplicate')
  async deduplicate(@Body() dto: DedupLeadsDto) {
    return this.leadsService.deduplicate(
      dto.franchisor,
      dto.accountId ?? null,
      dto.phoneColumn,
      dto.rows,
      dto.limit ?? null,
    );
  }
}
