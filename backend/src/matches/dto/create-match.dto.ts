import { IsNumber, IsPositive, IsEnum, IsOptional, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { MatchStatus } from '../../entities/match-status.enum';

export class TeamScoreDto {
  @IsNumber()
  @IsPositive()
  teamId: number;

  @IsNumber()
  rawScore: number;
}

export class CreateMatchDto {
  @IsNumber()
  @IsPositive()
  gameId: number;

  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  round?: number;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TeamScoreDto)
  teams: TeamScoreDto[];
}
