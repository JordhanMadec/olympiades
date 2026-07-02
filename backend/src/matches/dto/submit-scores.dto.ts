import { IsArray, ValidateNested, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { TeamScoreDto } from './create-match.dto';

export class SubmitScoresDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TeamScoreDto)
  scores: TeamScoreDto[];
}
