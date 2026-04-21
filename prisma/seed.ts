import { PrismaClient, FundStatus, InvestorType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Clean existing data
  await prisma.investment.deleteMany();
  await prisma.investor.deleteMany();
  await prisma.fund.deleteMany();

  // 2. Create Funds
  const fund1 = await prisma.fund.create({
    data: {
      name: 'Titanbay Growth Fund I',
      vintage_year: 2023,
      target_size_usd: 250000000.0,
      status: FundStatus.Investing,
    },
  });

  const fund2 = await prisma.fund.create({
    data: {
      name: 'Titanbay Growth Fund II',
      vintage_year: 2025,
      target_size_usd: 500000000.0,
      status: FundStatus.Fundraising,
    },
  });

  // 3. Create Investors
  const investor1 = await prisma.investor.create({
    data: {
      name: 'Global Pensions Inc',
      investor_type: InvestorType.Institution,
      email: 'contact@globalpensions.com',
    },
  });

  const investor2 = await prisma.investor.create({
    data: {
      name: 'Alice Smith',
      investor_type: InvestorType.Individual,
      email: 'alice.smith@example.com',
    },
  });

  // 4. Create Investments
  await prisma.investment.create({
    data: {
      fund_id: fund1.id,
      investor_id: investor1.id,
      amount_usd: 50000000.0,
      investment_date: new Date('2024-01-10'),
    },
  });

  await prisma.investment.create({
    data: {
      fund_id: fund1.id,
      investor_id: investor2.id,
      amount_usd: 1000000.0,
      investment_date: new Date('2024-02-15'),
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
