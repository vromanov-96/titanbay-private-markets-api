import { Module } from '@nestjs/common';
import { FundsService } from './funds.service';
import { FundsController } from './funds.controller';
import { CommitmentsModule } from '../commitments/commitments.module';

@Module({
  imports: [CommitmentsModule],
  controllers: [FundsController],
  providers: [FundsService],
})
export class FundsModule {}
