import { IsInt, Min, IsNumber, IsOptional } from 'class-validator';

export class ScoreEntryDto {
  @IsInt()
  @Min(1)
  teamId: number;

  @IsNumber()
  rawScore: number;

  @IsInt()
  @IsOptional()
  rank?: number;
}
