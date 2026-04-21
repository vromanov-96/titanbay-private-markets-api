import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { InvestorsService } from './investors.service';
import { CreateInvestorDto } from './dto/create-investor.dto';
import { Investor } from './entities/investor.entity';

@Controller('investors')
@UseInterceptors(ClassSerializerInterceptor)
export class InvestorsController {
  constructor(private readonly investorsService: InvestorsService) {}

  @Post()
  async create(
    @Body() createInvestorDto: CreateInvestorDto,
  ): Promise<Investor> {
    const investor = await this.investorsService.create(createInvestorDto);
    return new Investor(investor);
  }

  @Get()
  async findAll(): Promise<Investor[]> {
    const investors = await this.investorsService.findAll();
    return investors.map((investor) => new Investor(investor));
  }
}
