import { Prisma } from '@prisma/client';
import { Transform, Exclude } from 'class-transformer';

export class Investment {
  id!: string;
  investor_id!: string;
  fund_id!: string;

  @Transform(({ value }) =>
    value instanceof Prisma.Decimal ? value.toFixed(2) : value,
  )
  amount_usd!: string;

  @Transform(({ value }) => {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    return value;
  })
  investment_date!: string;

  @Exclude()
  investor?: any;

  @Exclude()
  fund?: any;

  constructor(partial: any) {
    Object.assign(this, partial);
    if ((this.amount_usd as any) instanceof Prisma.Decimal) {
      this.amount_usd = (this.amount_usd as any).toFixed(2);
    }
    if ((this.investment_date as any) instanceof Date) {
      this.investment_date = (this.investment_date as any)
        .toISOString()
        .split('T')[0];
    }
  }
}
