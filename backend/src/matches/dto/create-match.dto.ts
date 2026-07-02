import { IsInt, Min, IsOptional, IsArray, ArrayMinSize } from 'class-validator';

export class CreateMatchDto {
  @IsInt()
  @Min(1)
  gameId: number;

  @IsInt()
  @Min(1)
  matchNumber: number;

  @IsInt()
  @IsOptional()
  round?: number;

  @IsInt()
  @IsOptional()
  bracketPosition?: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  teamIds: number[];
}
