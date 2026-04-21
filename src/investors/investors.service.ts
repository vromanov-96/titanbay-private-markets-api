import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { CreateInvestorDto } from './dto/create-investor.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvestorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInvestorDto: CreateInvestorDto) {
    try {
      return await this.prisma.investor.create({
        data: createInvestorDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.investor.findMany();
  }
}
