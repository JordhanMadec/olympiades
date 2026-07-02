import { Test, TestingModule } from '@nestjs/testing';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

describe('TeamsController', () => {
  let controller: TeamsController;
  let service: TeamsService;

  const mockTeamsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockTeam = {
    id: 1,
    name: 'Les Champions',
    color: '#FF0000',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        {
          provide: TeamsService,
          useValue: mockTeamsService,
        },
      ],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
    service = module.get<TeamsService>(TeamsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a team', async () => {
      const dto: CreateTeamDto = {
        name: 'Les Champions',
        color: '#FF0000',
      };

      mockTeamsService.create.mockResolvedValue(mockTeam);

      const result = await controller.create(dto);
      expect(result).toEqual(mockTeam);
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should validate team name is unique', async () => {
      const dto: CreateTeamDto = {
        name: 'Les Champions',
        color: '#FF0000',
      };

      mockTeamsService.create.mockRejectedValue(new Error('Duplicate team name'));

      await expect(controller.create(dto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return array of teams', async () => {
      const teams = [mockTeam, { ...mockTeam, id: 2, name: 'Les Vainqueurs' }];
      mockTeamsService.findAll.mockResolvedValue(teams);

      const result = await controller.findAll();
      expect(result).toEqual(teams);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no teams exist', async () => {
      mockTeamsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a team by id', async () => {
      mockTeamsService.findOne.mockResolvedValue(mockTeam);

      const result = await controller.findOne(1);
      expect(result).toEqual(mockTeam);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw error if team not found', async () => {
      mockTeamsService.findOne.mockRejectedValue(new Error('Team not found'));

      await expect(controller.findOne(999)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a team', async () => {
      const dto: UpdateTeamDto = {
        name: 'Les Super Champions',
        color: '#00FF00',
      };

      const updatedTeam = { ...mockTeam, ...dto };
      mockTeamsService.update.mockResolvedValue(updatedTeam);

      const result = await controller.update(1, dto);
      expect(result).toEqual(updatedTeam);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });

    it('should allow partial updates', async () => {
      const dto: UpdateTeamDto = {
        color: '#0000FF',
      };

      const updatedTeam = { ...mockTeam, color: '#0000FF' };
      mockTeamsService.update.mockResolvedValue(updatedTeam);

      const result = await controller.update(1, dto);
      expect(result.color).toBe('#0000FF');
      expect(result.name).toBe(mockTeam.name); // Name unchanged
    });
  });

  describe('remove', () => {
    it('should delete a team', async () => {
      mockTeamsService.remove.mockResolvedValue(undefined);

      await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw error if team has associated matches', async () => {
      mockTeamsService.remove.mockRejectedValue(
        new Error('Cannot delete team with associated matches')
      );

      await expect(controller.remove(1)).rejects.toThrow();
    });
  });
});
