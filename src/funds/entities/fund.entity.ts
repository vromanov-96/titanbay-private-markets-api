import { FundStatus, Prisma } from '@prisma/client';
import { Transform } from 'class-transformer';

export class Fund {
  id: string;
  name: string;
  vintage_year: number;

  @Transform(({ value }) =>
    value instanceof Prisma.Decimal ? value.toFixed(2) : value,
  )
  target_size_usd: string;

  status: FundStatus;
  created_at: Date;

  constructor(partial: any) {
    Object.assign(this, partial);
    if ((this.target_size_usd as any) instanceof Prisma.Decimal) {
      this.target_size_usd = (this.target_size_usd as any).toFixed(2);
    }
  }
}
