import { IsString, IsNotEmpty, IsEnum, IsOptional, IsIn } from 'class-validator';
import { GameType, GameFormat } from '../../entities/enums';

export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(GameType)
  type: GameType;

  @IsEnum(GameFormat)
  format: GameFormat;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  scoringDirection?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  description?: string;
}
