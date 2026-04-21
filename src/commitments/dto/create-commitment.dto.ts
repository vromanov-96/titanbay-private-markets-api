import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';

export class CreateCommitmentDto {
  @IsUUID()
  @IsNotEmpty()
  investor_id!: string;

  @IsUUID()
  @IsNotEmpty()
  fund_id!: string;

  @IsNumber()
  @Min(0)
  amount_usd!: number;

  @IsDateString()
  @IsOptional()
  investment_date?: string;
}

export class CreateNestedInvestmentDto extends OmitType(CreateCommitmentDto, [
  'fund_id',
] as const) {}
