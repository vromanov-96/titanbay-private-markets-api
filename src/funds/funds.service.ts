import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFundDto } from './dto/create-fund.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FundsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFundDto: CreateFundDto) {
    return this.prisma.fund.create({
      data: createFundDto,
    });
  }

  async findAll() {
    return this.prisma.fund.findMany();
  }

  async findOne(id: string) {
    const fund = await this.prisma.fund.findUnique({
      where: { id },
    });
    if (!fund) {
      throw new NotFoundException(`Fund with ID ${id} not found`);
    }
    return fund;
  }

  async update(id: string, updateFundDto: UpdateFundDto) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, ...data } = updateFundDto;
      return await this.prisma.fund.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Fund with ID ${id} not found`);
      }
      throw error;
    }
  }
}
