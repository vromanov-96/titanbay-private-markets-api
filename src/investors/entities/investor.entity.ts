import { InvestorType } from '@prisma/client';

export class Investor {
  id!: string;
  name!: string;
  investor_type!: InvestorType;
  email!: string;
  created_at!: Date;

  constructor(partial: any) {
    Object.assign(this, partial);
  }
}
