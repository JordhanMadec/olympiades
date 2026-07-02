import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../entities/game.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GameType } from '../entities/enums';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
  ) {}

  findAll(): Promise<Game[]> {
    return this.gameRepo.find();
  }

  async findOne(id: number): Promise<Game> {
    const game = await this.gameRepo.findOne({ where: { id } });
    if (!game) throw new NotFoundException(`Game #${id} not found`);
    return game;
  }

  async create(dto: CreateGameDto): Promise<Game> {
    const scoringDirection =
      dto.scoringDirection ?? (dto.type === GameType.TIME ? 'ASC' : 'DESC');
    const game = this.gameRepo.create({ ...dto, scoringDirection });
    return this.gameRepo.save(game);
  }

  async update(id: number, dto: UpdateGameDto): Promise<Game> {
    const game = await this.findOne(id);
    Object.assign(game, dto);
    return this.gameRepo.save(game);
  }

  async remove(id: number): Promise<void> {
    const game = await this.findOne(id);
    await this.gameRepo.remove(game);
  }
}
