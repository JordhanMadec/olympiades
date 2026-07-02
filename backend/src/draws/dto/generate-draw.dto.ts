import { IsNumber, IsPositive } from 'class-validator';

export class GenerateDrawDto {
  @IsNumber()
  @IsPositive()
  gameId: number;
}
