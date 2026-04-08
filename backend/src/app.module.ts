import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './leads/lead.entity.js';
import { LeadsModule } from './leads/leads.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'leads.db',
      entities: [Lead],
      synchronize: true,
    }),
    LeadsModule,
  ],
})
export class AppModule {}
