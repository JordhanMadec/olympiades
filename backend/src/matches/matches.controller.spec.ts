import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateScoresDto } from './dto/update-scores.dto';

describe('MatchesController', () => {
  let controller: MatchesController;
  let service: MatchesService;

  const mockMatchesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateScores: jest.fn(),
  };

  const mockMatch = {
    id: 1,
    gameId: 1,
    matchNumber: 1,
    status: 'PENDING',
    matchTeams: [
      { id: 1, teamId: 1, matchId: 1, isEliminated: false },
      { id: 2, teamId: 2, matchId: 1, isEliminated: false },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [
        {
          provide: MatchesService,
          useValue: mockMatchesService,
        },
      ],
    }).compile();

    controller = module.get<MatchesController>(MatchesController);
    service = module.get<MatchesService>(MatchesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a match', async () => {
      const dto: CreateMatchDto = {
        gameId: 1,
        matchNumber: 1,
        teamIds: [1, 2],
      };

      mockMatchesService.create.mockResolvedValue(mockMatch);

      const result = await controller.create(dto);
      expect(result).toEqual(mockMatch);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return array of matches', async () => {
      mockMatchesService.findAll.mockResolvedValue([mockMatch]);

      const result = await controller.findAll();
      expect(result).toEqual([mockMatch]);
    });

    it('should filter by gameId when provided', async () => {
      mockMatchesService.findAll.mockResolvedValue([mockMatch]);

      const result = await controller.findAll('1');
      expect(result).toEqual([mockMatch]);
      expect(service.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('updateScores', () => {
    it('should update scores and calculate points', async () => {
      const dto: UpdateScoresDto = {
        scores: [
          { teamId: 1, rawScore: 10 },
          { teamId: 2, rawScore: 8 },
        ],
      };

      const updatedMatch = {
        ...mockMatch,
        status: 'COMPLETED',
        matchTeams: [
          { id: 1, teamId: 1, matchId: 1, rawScore: 10, rank: 1, points: 10, isEliminated: false },
          { id: 2, teamId: 2, matchId: 1, rawScore: 8, rank: 2, points: 8, isEliminated: false },
        ],
      };

      mockMatchesService.updateScores.mockResolvedValue(updatedMatch);

      const result = await controller.updateScores(1, dto);
      expect(result).toEqual(updatedMatch);
      expect(service.updateScores).toHaveBeenCalledWith(1, dto);
    });

    it('should calculate ranks based on scoringDirection', async () => {
      // For TIME games (ASC), lower is better
      const dto: UpdateScoresDto = {
        scores: [
          { teamId: 1, rawScore: 120 }, // 2 minutes (worse)
          { teamId: 2, rawScore: 90 },  // 1:30 (better)
        ],
      };

      const updatedMatch = {
        ...mockMatch,
        matchTeams: [
          { teamId: 1, rawScore: 120, rank: 2, points: 8 },
          { teamId: 2, rawScore: 90, rank: 1, points: 10 },
        ],
      };

      mockMatchesService.updateScores.mockResolvedValue(updatedMatch);

      const result = await controller.updateScores(1, dto);
      expect(result.matchTeams[1].rank).toBe(1); // Team 2 is first
      expect(result.matchTeams[0].rank).toBe(2); // Team 1 is second
    });
  });
});
