import { IsEnum, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { MatchStatus } from '../../entities/match-status.enum';
import { TeamScoreDto } from './create-match.dto';

export class UpdateMatchDto {
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamScoreDto)
  teams?: TeamScoreDto[];

  @IsOptional()
  @IsNumber()
  round?: number;
}
