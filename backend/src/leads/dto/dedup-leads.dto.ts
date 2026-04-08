import { IsString, IsArray } from 'class-validator';

export class DedupLeadsDto {
  @IsString()
  franchisor!: string;

  @IsString()
  phoneColumn!: string;

  @IsArray()
  rows!: Record<string, string>[];
}
