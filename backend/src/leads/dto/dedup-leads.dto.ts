import {
  IsString,
  IsArray,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';

export class DedupLeadsDto {
  @IsString()
  franchisor!: string;

  @IsOptional()
  @IsUUID()
  accountId?: string | null;

  @IsString()
  phoneColumn!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number | null;

  @IsArray()
  rows!: Record<string, string>[];
}
