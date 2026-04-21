import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FundsService } from './funds.service';
import { CreateFundDto } from './dto/create-fund.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { CommitmentsService } from '../commitments/commitments.service';
import { CreateNestedInvestmentDto } from '../commitments/dto/create-commitment.dto';
import { Fund } from './entities/fund.entity';
import { Investment } from '../commitments/entities/investment.entity';

@Controller('funds')
@UseInterceptors(ClassSerializerInterceptor)
export class FundsController {
  constructor(
    private readonly fundsService: FundsService,
    private readonly commitmentsService: CommitmentsService,
  ) {}

  @Post()
  async create(@Body() createFundDto: CreateFundDto): Promise<Fund> {
    const fund = await this.fundsService.create(createFundDto);
    return new Fund(fund);
  }

  @Get()
  async findAll(): Promise<Fund[]> {
    const funds = await this.fundsService.findAll();
    return funds.map((fund) => new Fund(fund));
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Fund> {
    const fund = await this.fundsService.findOne(id);
    return new Fund(fund);
  }

  @Put()
  async update(@Body() updateFundDto: UpdateFundDto): Promise<Fund> {
    const fund = await this.fundsService.update(
      updateFundDto.id,
      updateFundDto,
    );
    return new Fund(fund);
  }

  // Nested Investment Endpoints
  @Get(':id/investments')
  async findInvestments(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Investment[]> {
    await this.fundsService.findOne(id);
    const investments = await this.commitmentsService.findAllByFund(id);
    return investments.map((investment) => new Investment(investment));
  }

  @Post(':id/investments')
  async createInvestment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() createNestedInvestmentDto: CreateNestedInvestmentDto,
  ): Promise<Investment> {
    await this.fundsService.findOne(id);
    const investment = await this.commitmentsService.create({
      ...createNestedInvestmentDto,
      fund_id: id,
    });
    return new Investment(investment);
  }
}
