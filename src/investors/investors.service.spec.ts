import { Test, TestingModule } from '@nestjs/testing';
import { InvestorsService } from './investors.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { InvestorType, Prisma } from '@prisma/client';

describe('InvestorsService', () => {
  let service: InvestorsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    investor: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestorsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InvestorsService>(InvestorsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createInvestorDto = {
      name: 'John Doe',
      investor_type: InvestorType.Individual,
      email: 'john@example.com',
    };

    it('should create an investor', async () => {
      const result = { id: 'uuid', ...createInvestorDto, created_at: new Date() };
      mockPrismaService.investor.create.mockResolvedValue(result);

      expect(await service.create(createInvestorDto)).toEqual(result);
      expect(prisma.investor.create).toHaveBeenCalledWith({
        data: createInvestorDto,
      });
    });

    it('should throw ConflictException on duplicate email', async () => {
      mockPrismaService.investor.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('test', {code: 'P2002', clientVersion: '1'}));

      await expect(service.create(createInvestorDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of investors', async () => {
      const result = [{ id: 'uuid', name: 'John Doe', email: 'john@example.com' }];
      mockPrismaService.investor.findMany.mockResolvedValue(result);

      expect(await service.findAll()).toEqual(result);
      expect(prisma.investor.findMany).toHaveBeenCalled();
    });
  });
});
