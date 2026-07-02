import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
  ) {}

  async findAll(): Promise<Team[]> {
    return this.teamRepo.find();
  }

  async findOne(id: number): Promise<Team> {
    const team = await this.teamRepo.findOne({ where: { id } });
    if (!team) throw new NotFoundException(`Team #${id} not found`);
    return team;
  }

  async create(dto: CreateTeamDto): Promise<Team> {
    const existing = await this.teamRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Team with name "${dto.name}" already exists`);
    const team = this.teamRepo.create(dto);
    return this.teamRepo.save(team);
  }

  async update(id: number, dto: UpdateTeamDto): Promise<Team> {
    const team = await this.findOne(id);
    if (dto.name && dto.name !== team.name) {
      const existing = await this.teamRepo.findOne({ where: { name: dto.name } });
      if (existing) throw new ConflictException(`Team with name "${dto.name}" already exists`);
    }
    Object.assign(team, dto);
    return this.teamRepo.save(team);
  }

  async remove(id: number): Promise<void> {
    const team = await this.findOne(id);
    await this.teamRepo.remove(team);
  }
}
