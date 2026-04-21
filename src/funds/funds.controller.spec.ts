import { Test, TestingModule } from '@nestjs/testing';
import { FundsController } from './funds.controller';
import { FundsService } from './funds.service';
import { CommitmentsService } from '../commitments/commitments.service';
import { CreateFundDto } from './dto/create-fund.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { FundStatus, Prisma } from '@prisma/client';
import { Fund } from './entities/fund.entity';
import { Investment } from '../commitments/entities/investment.entity';

describe('FundsController', () => {
  let controller: FundsController;
  let fundsService: FundsService;
  let commitmentsService: CommitmentsService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FundsController],
      providers: [
        {
          provide: FundsService,
          useValue: mockFundsService,
        },
        {
          provide: CommitmentsService,
          useValue: mockCommitmentsService,
        },
      ],
    }).compile();

    controller = module.get<FundsController>(FundsController);
    fundsService = module.get<FundsService>(FundsService);
    commitmentsService = module.get<CommitmentsService>(CommitmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a fund', async () => {
      const createFundDto: CreateFundDto = {
        name: 'Test Fund',
        vintage_year: 2024,
        target_size_usd: 1000000,
        status: 'Investing',
      };
      const result = {
        id: 'uuid',
        ...createFundDto,
        target_size_usd: new Prisma.Decimal(1000000),
        created_at: new Date(),
      };
      mockFundsService.create.mockResolvedValue(result);

      const response = await controller.create(createFundDto);
      expect(response).toBeInstanceOf(Fund);
      expect(response.id).toEqual(result.id);
      expect(response.target_size_usd).toEqual('1000000.00');
      expect(mockFundsService.create).toHaveBeenCalledWith(createFundDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of funds', async () => {
      const result = [
        {
          id: 'uuid',
          name: 'Test Fund',
          vintage_year: 2024,
          target_size_usd: new Prisma.Decimal(1000000),
          status: 'Investing' as FundStatus,
          created_at: new Date(),
        },
      ];
      mockFundsService.findAll.mockResolvedValue(result);

      const response = await controller.findAll();
      expect(response[0]).toBeInstanceOf(Fund);
      expect(response[0].id).toEqual(result[0].id);
      expect(response[0].target_size_usd).toEqual('1000000.00');
      expect(mockFundsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single fund', async () => {
      const id = 'uuid';
      const result = {
        id,
        name: 'Test Fund',
        vintage_year: 2024,
        target_size_usd: new Prisma.Decimal(1000000),
        status: 'Investing' as FundStatus,
        created_at: new Date(),
      };
      mockFundsService.findOne.mockResolvedValue(result);

      const response = await controller.findOne(id);
      expect(response).toBeInstanceOf(Fund);
      expect(response.id).toEqual(id);
      expect(response.target_size_usd).toEqual('1000000.00');
      expect(mockFundsService.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a fund', async () => {
      const id = 'uuid';
      const updateFundDto: UpdateFundDto = {
        id,
        name: 'Updated Fund',
        vintage_year: 2025,
        target_size_usd: 2000000,
        status: 'Closed',
      };
      const result = {
        ...updateFundDto,
        target_size_usd: new Prisma.Decimal(2000000),
        created_at: new Date(),
      };
      mockFundsService.update.mockResolvedValue(result);

      const response = await controller.update(updateFundDto);
      expect(response).toBeInstanceOf(Fund);
      expect(response.id).toEqual(id);
      expect(response.target_size_usd).toEqual('2000000.00');
      expect(mockFundsService.update).toHaveBeenCalledWith(id, updateFundDto);
    });
  });

  describe('findInvestments', () => {
    it('should return investments for a fund', async () => {
      const id = 'uuid';
      const investments = [
        {
          id: 'inv-uuid',
          fund_id: id,
          investor_id: 'inst-uuid',
          amount_usd: new Prisma.Decimal(500000),
          investment_date: new Date('2024-03-15'),
        },
      ];
      mockFundsService.findOne.mockResolvedValue({ id });
      mockCommitmentsService.findAllByFund.mockResolvedValue(investments);

      const response = await controller.findInvestments(id);
      expect(response[0]).toBeInstanceOf(Investment);
      expect(response[0].amount_usd).toEqual('500000.00');
      expect(response[0].investment_date).toEqual('2024-03-15');
      expect(mockFundsService.findOne).toHaveBeenCalledWith(id);
      expect(mockCommitmentsService.findAllByFund).toHaveBeenCalledWith(id);
    });
  });

  describe('createInvestment', () => {
    it('should create an investment for a fund', async () => {
      const id = 'uuid';
      const createCommitmentDto = {
        investor_id: 'inst-uuid',
        amount_usd: 500000,
      };
      const result = {
        id: 'inv-uuid',
        fund_id: id,
        ...createCommitmentDto,
        amount_usd: new Prisma.Decimal(500000),
        investment_date: new Date('2024-03-15'),
      };
      mockFundsService.findOne.mockResolvedValue({ id });
      mockCommitmentsService.create.mockResolvedValue(result);

      const response = await controller.createInvestment(
        id,
        createCommitmentDto,
      );
      expect(response).toBeInstanceOf(Investment);
      expect(response.amount_usd).toEqual('500000.00');
      expect(response.investment_date).toEqual('2024-03-15');
      expect(mockFundsService.findOne).toHaveBeenCalledWith(id);
      expect(mockCommitmentsService.create).toHaveBeenCalledWith({
        ...createCommitmentDto,
        fund_id: id,
      });
    });
  });
});
