import { Test, TestingModule } from '@nestjs/testing';
import { CommitmentsService } from './commitments.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('CommitmentsService', () => {
  let service: CommitmentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    investment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommitmentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CommitmentsService>(CommitmentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCommitmentDto = {
      investor_id: 'investor-uuid',
      fund_id: 'fund-uuid',
      amount_usd: 100000,
      investment_date: '2024-03-15',
    };

    it('should create an investment', async () => {
      const result = {
        id: 'inv-uuid',
        ...createCommitmentDto,
        amount_usd: new Prisma.Decimal(100000),
        investment_date: new Date('2024-03-15'),
      };
      mockPrismaService.investment.create.mockResolvedValue(result);

      expect(await service.create(createCommitmentDto)).toEqual(result);
      expect(prisma.investment.create).toHaveBeenCalledWith({
        data: {
          investor_id: createCommitmentDto.investor_id,
          fund_id: createCommitmentDto.fund_id,
          amount_usd: createCommitmentDto.amount_usd,
          investment_date: new Date(createCommitmentDto.investment_date),
        },
      });
    });

    it('should throw BadRequestException if foreign key constraint fails', async () => {
      mockPrismaService.investment.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('test', {code: 'P2003', clientVersion: '1', meta: {field_name: 'fund_id'}}));

      await expect(service.create(createCommitmentDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAllByFund', () => {
    it('should return all investments for a fund', async () => {
      const fundId = 'fund-uuid';
      const result = [
        {
          id: 'inv-uuid',
          fund_id: fundId,
          amount_usd: new Prisma.Decimal(50000),
          investor: { name: 'Investor A' },
        },
      ];
      mockPrismaService.investment.findMany.mockResolvedValue(result);

      expect(await service.findAllByFund(fundId)).toEqual(result);
      expect(prisma.investment.findMany).toHaveBeenCalledWith({
        where: { fund_id: fundId },
        include: { investor: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single investment', async () => {
      const id = 'inv-uuid';
      const result = {
        id,
        amount_usd: new Prisma.Decimal(75000),
        investor: { name: 'Investor A' },
        fund: { name: 'Fund B' },
      };
      mockPrismaService.investment.findUnique.mockResolvedValue(result);

      expect(await service.findOne(id)).toEqual(result);
      expect(prisma.investment.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: { investor: true, fund: true },
      });
    });

    it('should throw NotFoundException if investment not found', async () => {
      mockPrismaService.investment.findUnique.mockResolvedValue(null);

      await expect(service.findOne('uuid')).rejects.toThrow(NotFoundException);
    });
  });
});
