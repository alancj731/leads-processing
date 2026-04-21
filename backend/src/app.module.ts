import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './leads/lead.entity.js';
import { LeadsModule } from './leads/leads.module.js';
import { Account } from './accounts/account.entity.js';
import { AccountsModule } from './accounts/accounts.module.js';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Copy backend/.env.example to backend/.env and paste your Supabase Session Pooler connection string.',
  );
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: databaseUrl,
      ssl: { rejectUnauthorized: false },
      entities: [Lead, Account],
      synchronize: true,
    }),
    LeadsModule,
    AccountsModule,
  ],
})
export class AppModule {}
