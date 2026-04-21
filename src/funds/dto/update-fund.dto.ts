import { IsUUID } from 'class-validator';
import { CreateFundDto } from './create-fund.dto';

export class UpdateFundDto extends CreateFundDto {
  @IsUUID()
  id!: string;
}
