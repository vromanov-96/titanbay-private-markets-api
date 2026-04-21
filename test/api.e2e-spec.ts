import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { FundsService } from './../src/funds/funds.service';
import { CommitmentsService } from './../src/commitments/commitments.service';
import { InvestorsService } from './../src/investors/investors.service';
import { FundStatus, InvestorType, Prisma } from '@prisma/client';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  const mockFundsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockCommitmentsService = {
    create: jest.fn(),
    findAllByFund: jest.fn(),
  };

  const mockInvestorsService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FundsService)
      .useValue(mockFundsService)
      .overrideProvider(CommitmentsService)
      .useValue(mockCommitmentsService)
      .overrideProvider(InvestorsService)
      .useValue(mockInvestorsService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Funds', () => {
    const validFund = {
      name: 'Titanbay Growth Fund II',
      vintage_year: 2025,
      target_size_usd: 500000000.0,
      status: FundStatus.Fundraising,
    };

    describe('POST /funds (Happy Path)', () => {
      it('should create a fund and return it as a Fund entity', async () => {
        const createdFund = {
          id: '660e8400-e29b-41d4-a716-446655440001',
          ...validFund,
          target_size_usd: new Prisma.Decimal(validFund.target_size_usd),
          created_at: new Date('2024-09-22T14:20:00Z'),
        };
        mockFundsService.create.mockResolvedValue(createdFund);

        const response = await request(app.getHttpServer())
          .post('/funds')
          .send(validFund)
          .expect(201);

        expect(response.body).toEqual({
          id: createdFund.id,
          name: createdFund.name,
          vintage_year: createdFund.vintage_year,
          target_size_usd: '500000000.00',
          status: createdFund.status,
          created_at: createdFund.created_at.toISOString(),
        });
      });
    });

    describe('POST /funds (Unhappy Path - Validation)', () => {
      it('should fail with empty object', () => {
        return request(app.getHttpServer())
          .post('/funds')
          .send({})
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toContain('name should not be empty');
            expect(res.body.message).toContain('name must be a string');
          });
      });

      it('should fail with invalid vintage_year', () => {
        return request(app.getHttpServer())
          .post('/funds')
          .send({ ...validFund, vintage_year: 1800 })
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toContain(
              'vintage_year must not be less than 1900',
            );
          });
      });

      it('should fail with invalid status', () => {
        return request(app.getHttpServer())
          .post('/funds')
          .send({ ...validFund, status: 'INVALID' })
          .expect(400);
      });
    });

    describe('GET /funds', () => {
      it('should return all funds', async () => {
        mockFundsService.findAll.mockResolvedValue([]);
        await request(app.getHttpServer()).get('/funds').expect(200);
      });
    });

    describe('GET /funds/:id', () => {
      it('should fail with malformed uuid', () => {
        return request(app.getHttpServer())
          .get('/funds/123')
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toContain(
              'Validation failed (uuid is expected)',
            );
          });
      });
    });

    describe('PUT /funds', () => {
      it('should fail with invalid id', () => {
        return request(app.getHttpServer())
          .put('/funds')
          .send({ ...validFund, id: 'not-a-uuid' })
          .expect(400);
      });
    });
  });

  describe('Investors', () => {
    const validInvestor = {
      name: 'John Doe',
      investor_type: InvestorType.Individual,
      email: 'john@example.com',
    };

    describe('POST /investors (Happy Path)', () => {
      it('should create an investor', async () => {
        const createdInvestor = {
          id: '770e8400-e29b-41d4-a716-446655440002',
          ...validInvestor,
          created_at: new Date(),
        };
        mockInvestorsService.create.mockResolvedValue(createdInvestor);

        const response = await request(app.getHttpServer())
          .post('/investors')
          .send(validInvestor)
          .expect(201);

        expect(response.body.id).toEqual(createdInvestor.id);
      });
    });

    describe('POST /investors (Unhappy Path - Validation)', () => {
      it('should fail with invalid email', () => {
        return request(app.getHttpServer())
          .post('/investors')
          .send({ ...validInvestor, email: 'not-an-email' })
          .expect(400);
      });
    });
  });

  describe('Investments', () => {
    const fundId = '550e8400-e29b-41d4-a716-446655440000';
    const validInvestment = {
      investor_id: '770e8400-e29b-41d4-a716-446655440002',
      amount_usd: 50000000.0,
      investment_date: '2024-03-15',
    };

    describe('POST /funds/:id/investments (Happy Path)', () => {
      it('should create an investment', async () => {
        const createdInvestment = {
          id: '990e8400-e29b-41d4-a716-446655440004',
          fund_id: fundId,
          ...validInvestment,
          amount_usd: new Prisma.Decimal(validInvestment.amount_usd),
          investment_date: new Date(validInvestment.investment_date),
        };
        mockFundsService.findOne.mockResolvedValue({ id: fundId });
        mockCommitmentsService.create.mockResolvedValue(createdInvestment);

        const response = await request(app.getHttpServer())
          .post(`/funds/${fundId}/investments`)
          .send(validInvestment)
          .expect(201);

        expect(response.body).toEqual({
          id: createdInvestment.id,
          investor_id: createdInvestment.investor_id,
          fund_id: createdInvestment.fund_id,
          amount_usd: '50000000.00',
          investment_date: validInvestment.investment_date,
        });
      });
    });

    describe('POST /funds/:id/investments (Unhappy Path - Validation)', () => {
      it('should fail with malformed fund id', () => {
        return request(app.getHttpServer())
          .post('/funds/123/investments')
          .send(validInvestment)
          .expect(400);
      });

      it('should fail with invalid amount', () => {
        return request(app.getHttpServer())
          .post(`/funds/${fundId}/investments`)
          .send({ ...validInvestment, amount_usd: -100 })
          .expect(400);
      });

      it('should fail with invalid date format', () => {
        return request(app.getHttpServer())
          .post(`/funds/${fundId}/investments`)
          .send({ ...validInvestment, investment_date: 'invalid' })
          .expect(400);
      });
    });

    describe('GET /funds/:id/investments', () => {
      it('should fail with malformed fund id', () => {
        return request(app.getHttpServer())
          .get('/funds/123/investments')
          .expect(400);
      });

      it('should return investments for a fund', async () => {
        mockFundsService.findOne.mockResolvedValue({ id: fundId });
        mockCommitmentsService.findAllByFund.mockResolvedValue([]);
        await request(app.getHttpServer())
          .get(`/funds/${fundId}/investments`)
          .expect(200);
      });
    });
  });
});
