import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { InvestorType } from '@prisma/client';

export class CreateInvestorDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(InvestorType)
  investor_type!: InvestorType;

  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
