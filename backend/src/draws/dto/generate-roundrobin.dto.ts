import { IsInt, Min, ArrayMinSize, IsArray } from 'class-validator';

export class GenerateRoundRobinDto {
  @IsInt()
  @Min(1)
  gameId: number;

  @IsArray()
  @ArrayMinSize(2)
  @IsInt({ each: true })
  teamIds: number[];

  @IsInt()
  @Min(1)
  numberOfMatches: number;

  @IsInt()
  @Min(2)
  teamsPerMatch: number;
}
