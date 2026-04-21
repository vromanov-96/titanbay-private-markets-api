import { Test, TestingModule } from '@nestjs/testing';
import { FundsService } from './funds.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { FundStatus, Prisma } from '@prisma/client';

describe('FundsService', () => {
  let service: FundsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    fund: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FundsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FundsService>(FundsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a fund', async () => {
      const dto = {
        name: 'Test Fund',
        vintage_year: 2024,
        target_size_usd: 1000000,
        status: 'Fundraising' as FundStatus,
      };
      const result = { id: 'uuid', ...dto };
      mockPrismaService.fund.create.mockResolvedValue(result);

      expect(await service.create(dto as any)).toEqual(result);
      expect(mockPrismaService.fund.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAll', () => {
    it('should return all funds', async () => {
      const result = [{ id: 'uuid', name: 'Test Fund' }];
      mockPrismaService.fund.findMany.mockResolvedValue(result);

      expect(await service.findAll()).toEqual(result);
      expect(mockPrismaService.fund.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single fund', async () => {
      const id = 'uuid';
      const result = { id, name: 'Test Fund' };
      mockPrismaService.fund.findUnique.mockResolvedValue(result);

      expect(await service.findOne(id)).toEqual(result);
      expect(mockPrismaService.fund.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
    });

    it('should throw NotFoundException if fund not found', async () => {
      mockPrismaService.fund.findUnique.mockResolvedValue(null);

      await expect(service.findOne('uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a fund', async () => {
      const id = 'uuid';
      const dto = { id, name: 'Updated Fund', status: 'Closed' as FundStatus };
      const { id: _, ...data } = dto;
      const result = { id, ...data };
      mockPrismaService.fund.update.mockResolvedValue(result);

      expect(await service.update(id, dto as any)).toEqual(result);
      expect(mockPrismaService.fund.update).toHaveBeenCalledWith({
        where: { id },
        data,
      });
    });

    it('should throw NotFoundException if prisma update fails with P2025', async () => {
      const id = 'uuid';
      const dto = { name: 'Updated Fund' };
      mockPrismaService.fund.update.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('test', {code: 'P2025', clientVersion: '1'}));

      await expect(service.update(id, dto as any)).rejects.toThrow(NotFoundException);
    });
  });
});
