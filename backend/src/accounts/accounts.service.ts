import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity.js';
import { CreateAccountDto } from './dto/create-account.dto.js';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  listByFranchisor(franchisor: string): Promise<Account[]> {
    return this.accountRepo.find({
      where: { franchisor },
      order: { name: 'ASC' },
    });
  }

  async create(dto: CreateAccountDto): Promise<Account> {
    const name = dto.name.trim();
    const franchisor = dto.franchisor.trim();
    const existing = await this.accountRepo.findOne({
      where: { name, franchisor },
    });
    if (existing) return existing;
    return this.accountRepo.save(this.accountRepo.create({ name, franchisor }));
  }
}
