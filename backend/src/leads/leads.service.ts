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
    phoneColumn: string,
    rows: Record<string, string>[],
  ) {
    // Parse all phones to E.164
    const parsed = rows.map((row) => ({
      row,
      e164: this.parseToE164(row[phoneColumn] ?? ''),
    }));

    // Separate valid from invalid
    const invalidRows: Record<string, string>[] = [];
    const valid: { row: Record<string, string>; e164: string }[] = [];
    for (const p of parsed) {
      if (p.e164 !== null) {
        valid.push(p as { row: Record<string, string>; e164: string });
      } else {
        invalidRows.push(p.row);
      }
    }

    // Deduplicate within the CSV itself (keep first occurrence)
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

    // Batch check existing phones in DB (chunks of 500)
    const allE164 = uniqueValid.map((p) => p.e164);
    const existingSet = new Set<string>();

    for (let i = 0; i < allE164.length; i += 500) {
      const chunk = allE164.slice(i, i + 500);
      const found = await this.leadRepo.find({
        where: { phone_number: In(chunk) },
        select: ['phone_number'],
      });
      found.forEach((f) => existingSet.add(f.phone_number));
    }

    // Split into new vs duplicate
    const newRows: Record<string, string>[] = [];
    const dbDuplicateRows: Record<string, string>[] = [];
    const toInsert: Partial<Lead>[] = [];

    for (const { row, e164 } of uniqueValid) {
      if (existingSet.has(e164)) {
        dbDuplicateRows.push({ ...row, [phoneColumn]: e164 });
        continue;
      }
      toInsert.push({ franchisor, phone_number: e164 });
      newRows.push({ ...row, [phoneColumn]: e164 });
    }

    // Bulk insert new leads
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
