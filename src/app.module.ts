import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FundsModule } from './funds/funds.module';
import { InvestorsModule } from './investors/investors.module';
import { CommitmentsModule } from './commitments/commitments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    FundsModule,
    InvestorsModule,
    CommitmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
