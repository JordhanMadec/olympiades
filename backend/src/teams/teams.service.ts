import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
  ) {}

  async findAll(): Promise<Team[]> {
    return this.teamsRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Team> {
    const team = await this.teamsRepository.findOne({ where: { id } });
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    return team;
  }

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    // Check if name already exists
    const existing = await this.teamsRepository.findOne({
      where: { name: createTeamDto.name },
    });
    if (existing) {
      throw new ConflictException(`Team with name "${createTeamDto.name}" already exists`);
    }

    const team = this.teamsRepository.create(createTeamDto);
    return this.teamsRepository.save(team);
  }

  async update(id: number, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const team = await this.findOne(id);

    // Check if new name conflicts with another team
    if (updateTeamDto.name && updateTeamDto.name !== team.name) {
      const existing = await this.teamsRepository.findOne({
        where: { name: updateTeamDto.name },
      });
      if (existing) {
        throw new ConflictException(`Team with name "${updateTeamDto.name}" already exists`);
      }
    }

    Object.assign(team, updateTeamDto);
    return this.teamsRepository.save(team);
  }

  async remove(id: number): Promise<void> {
    const team = await this.findOne(id);
    await this.teamsRepository.remove(team);
  }
}
