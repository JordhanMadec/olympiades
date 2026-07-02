import { IsInt, Min, ArrayMinSize, IsArray, IsBoolean, IsOptional } from 'class-validator';

export class GenerateBracketDto {
  @IsInt()
  @Min(1)
  gameId: number;

  @IsArray()
  @ArrayMinSize(2)
  @IsInt({ each: true })
  teamIds: number[];

  @IsBoolean()
  @IsOptional()
  useSeeding?: boolean;
}
