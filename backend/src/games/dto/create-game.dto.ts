import { IsString, IsNotEmpty, IsEnum, IsInt, Min, IsOptional } from 'class-validator';
import { GameType, GameFormat, ScoringDirection } from '../game.enums';

export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  rules: string;

  @IsEnum(GameType)
  gameType: GameType;

  @IsEnum(GameFormat)
  gameFormat: GameFormat;

  @IsEnum(ScoringDirection)
  scoringDirection: ScoringDirection;

  @IsInt()
  @Min(1)
  @IsOptional()
  teamsPerMatch?: number;
}
