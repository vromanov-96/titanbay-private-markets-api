import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateCommitmentDto } from './dto/create-commitment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommitmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCommitmentDto: CreateCommitmentDto) {
    try {
      return await this.prisma.investment.create({
        data: {
          investor_id: createCommitmentDto.investor_id,
          fund_id: createCommitmentDto.fund_id,
          amount_usd: createCommitmentDto.amount_usd,
          investment_date: createCommitmentDto.investment_date
            ? new Date(createCommitmentDto.investment_date)
            : undefined,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException(
          `Foreign key constraint failed: ${error.meta?.field_name}`,
        );
      }
      throw error;
    }
  }

  async findAllByFund(fundId: string) {
    return this.prisma.investment.findMany({
      where: { fund_id: fundId },
      include: {
        investor: true,
      },
    });
  }

  async findOne(id: string) {
    const commitment = await this.prisma.investment.findUnique({
      where: { id },
      include: {
        investor: true,
        fund: true,
      },
    });
    if (!commitment) {
      throw new NotFoundException(`Commitment with ID ${id} not found`);
    }
    return commitment;
  }
}
