import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { FundStatus } from '@prisma/client';

export class CreateFundDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(1900)
  vintage_year!: number;

  @IsNumber()
  @Min(0)
  target_size_usd!: number;

  @IsEnum(FundStatus)
  status!: FundStatus;
}
