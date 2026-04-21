import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Lead } from './lead.entity.js';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
  ) {}

  async deduplicate(
    franchisor: string,
    accountId: string | null,
    phoneColumn: string,
    rows: Record<string, string>[],
  ) {
    const parsed = rows.map((row) => ({
      row,
      e164: this.parseToE164(row[phoneColumn] ?? ''),
    }));

    const invalidRows: Record<string, string>[] = [];
    const valid: { row: Record<string, string>; e164: string }[] = [];
    for (const p of parsed) {
      if (p.e164 !== null) {
        valid.push(p as { row: Record<string, string>; e164: string });
      } else {
        invalidRows.push(p.row);
      }
    }

    const seenInCsv = new Set<string>();
    const csvDuplicateRows: Record<string, string>[] = [];
    const uniqueValid = valid.filter((p) => {
      if (seenInCsv.has(p.e164)) {
        csvDuplicateRows.push({ ...p.row, [phoneColumn]: p.e164 });
        return false;
      }
      seenInCsv.add(p.e164);
      return true;
    });

    const allE164 = uniqueValid.map((p) => p.e164);
    const existingSet = new Set<string>();

    for (let i = 0; i < allE164.length; i += 500) {
      const chunk = allE164.slice(i, i + 500);
      const where =
        accountId != null
          ? { franchisor, account_id: accountId, phone_number: In(chunk) }
          : { franchisor, phone_number: In(chunk) };
      const found = await this.leadRepo.find({
        where,
        select: ['phone_number'],
      });
      found.forEach((f) => existingSet.add(f.phone_number));
    }

    const newRows: Record<string, string>[] = [];
    const dbDuplicateRows: Record<string, string>[] = [];
    const toInsert: Partial<Lead>[] = [];

    for (const { row, e164 } of uniqueValid) {
      if (existingSet.has(e164)) {
        dbDuplicateRows.push({ ...row, [phoneColumn]: e164 });
        continue;
      }
      toInsert.push({
        franchisor,
        account_id: accountId ?? null,
        phone_number: e164,
      });
      newRows.push({ ...row, [phoneColumn]: e164 });
    }

    if (toInsert.length > 0) {
      await this.leadRepo
        .createQueryBuilder()
        .insert()
        .into(Lead)
        .values(toInsert)
        .execute();
    }

    const duplicateRows = [...dbDuplicateRows, ...csvDuplicateRows];

    return {
      added: newRows.length,
      duplicates: duplicateRows.length,
      invalid: invalidRows.length,
      newRows,
      duplicateRows,
      invalidRows,
    };
  }

  private parseToE164(raw: string): string | null {
    if (!raw || !raw.trim()) return null;
    const phone = parsePhoneNumberFromString(raw.trim(), 'US');
    if (!phone || !phone.isValid()) return null;
    if (phone.country !== 'US' && phone.country !== 'CA') return null;
    return phone.format('E.164');
  }
}
