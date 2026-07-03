import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GameType, GameFormat } from './game.enums';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
  ) {}

  async findAll(): Promise<Game[]> {
    return this.gamesRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Game> {
    const game = await this.gamesRepository.findOne({ where: { id } });
    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }
    return game;
  }

  async create(createGameDto: CreateGameDto): Promise<Game> {
    this.validateGameRules(createGameDto);
    const game = this.gamesRepository.create(createGameDto);
    return this.gamesRepository.save(game);
  }

  async update(id: number, updateGameDto: UpdateGameDto): Promise<Game> {
    const game = await this.findOne(id);
    this.validateGameRules({ ...game, ...updateGameDto });
    Object.assign(game, updateGameDto);
    return this.gamesRepository.save(game);
  }

  async remove(id: number): Promise<void> {
    const game = await this.findOne(id);
    await this.gamesRepository.remove(game);
  }

  private validateGameRules(gameData: Partial<CreateGameDto | UpdateGameDto>): void {
    const { gameType, gameFormat, teamsPerMatch } = gameData;

    // SCORE games must be ELIMINATION with 2 teams
    if (gameType === GameType.SCORE) {
      if (gameFormat && gameFormat !== GameFormat.ELIMINATION) {
        throw new BadRequestException('SCORE games must use ELIMINATION format');
      }
      if (teamsPerMatch && teamsPerMatch !== 2) {
        throw new BadRequestException('SCORE games must have exactly 2 teams per match');
      }
    }

    // TIME and POINTS games must be ROUND_ROBIN
    if (gameType === GameType.TIME || gameType === GameType.POINTS) {
      if (gameFormat && gameFormat !== GameFormat.ROUND_ROBIN) {
        throw new BadRequestException('TIME and POINTS games must use ROUND_ROBIN format');
      }
    }
  }
}
