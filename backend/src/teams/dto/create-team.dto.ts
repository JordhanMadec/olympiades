import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(7) // For hex colors like #FF5733
  color?: string;
}
