import { Test, TestingModule } from '@nestjs/testing';
import { InvestorsController } from './investors.controller';
import { InvestorsService } from './investors.service';
import { InvestorType } from '@prisma/client';
import { Investor } from './entities/investor.entity';

describe('InvestorsController', () => {
  let controller: InvestorsController;
  let service: InvestorsService;

  const mockInvestorsService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvestorsController],
      providers: [
        {
          provide: InvestorsService,
          useValue: mockInvestorsService,
        },
      ],
    }).compile();

    controller = module.get<InvestorsController>(InvestorsController);
    service = module.get<InvestorsService>(InvestorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an investor', async () => {
      const createInvestorDto = {
        name: 'John Doe',
        investor_type: InvestorType.Individual,
        email: 'john@example.com',
      };
      const result = { id: 'uuid', ...createInvestorDto, created_at: new Date() };
      mockInvestorsService.create.mockResolvedValue(result);

      const response = await controller.create(createInvestorDto);
      expect(response).toBeInstanceOf(Investor);
      expect(response.id).toEqual(result.id);
      expect(service.create).toHaveBeenCalledWith(createInvestorDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of investors', async () => {
      const result = [{ id: 'uuid', name: 'John Doe', email: 'john@example.com' }];
      mockInvestorsService.findAll.mockResolvedValue(result);

      const response = await controller.findAll();
      expect(response[0]).toBeInstanceOf(Investor);
      expect(response[0].id).toEqual(result[0].id);
      expect(service.findAll).toHaveBeenCalled();
    });
  });
});
