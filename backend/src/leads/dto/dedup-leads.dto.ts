import { IsString, IsArray, IsOptional, IsUUID } from 'class-validator';

export class DedupLeadsDto {
  @IsString()
  franchisor!: string;

  @IsOptional()
  @IsUUID()
  accountId?: string | null;

  @IsString()
  phoneColumn!: string;

  @IsArray()
  rows!: Record<string, string>[];
}
