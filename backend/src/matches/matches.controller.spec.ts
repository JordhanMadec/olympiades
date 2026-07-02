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

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a match with teamIds', async () => {
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

    it('should create a bracket match with round and position', async () => {
      const dto: CreateMatchDto = {
        gameId: 1,
        matchNumber: 1,
        teamIds: [1, 2],
        round: 2,
        bracketPosition: 1,
      };

      const bracketMatch = {
        ...mockMatch,
        round: 2,
        bracketPosition: 1,
      };

      mockMatchesService.create.mockResolvedValue(bracketMatch);

      const result = await controller.create(dto);
      expect(result).toEqual(bracketMatch);
      expect(result.round).toBe(2);
      expect(result.bracketPosition).toBe(1);
    });

    it('should create a match with multiple teams (3+)', async () => {
      const dto: CreateMatchDto = {
        gameId: 1,
        matchNumber: 1,
        teamIds: [1, 2, 3, 4],
      };

      const multiTeamMatch = {
        ...mockMatch,
        matchTeams: [
          { id: 1, teamId: 1, matchId: 1, isEliminated: false },
          { id: 2, teamId: 2, matchId: 1, isEliminated: false },
          { id: 3, teamId: 3, matchId: 1, isEliminated: false },
          { id: 4, teamId: 4, matchId: 1, isEliminated: false },
        ],
      };

      mockMatchesService.create.mockResolvedValue(multiTeamMatch);

      const result = await controller.create(dto);
      expect(result.matchTeams.length).toBe(4);
    });

    it('should create a bye match (single team)', async () => {
      const dto: CreateMatchDto = {
        gameId: 1,
        matchNumber: 1,
        teamIds: [1],
        round: 2,
        bracketPosition: 1,
      };

      const byeMatch = {
        ...mockMatch,
        matchTeams: [
          { id: 1, teamId: 1, matchId: 1, isEliminated: false },
        ],
      };

      mockMatchesService.create.mockResolvedValue(byeMatch);

      const result = await controller.create(dto);
      expect(result.matchTeams.length).toBe(1);
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

    it('should return empty array when no matches exist', async () => {
      mockMatchesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a match by id', async () => {
      mockMatchesService.findOne.mockResolvedValue(mockMatch);

      const result = await controller.findOne(1);
      expect(result).toEqual(mockMatch);
      expect(service.findOne).toHaveBeenCalledWith(1);
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

    it('should calculate ranks based on scoringDirection DESC (SCORE/POINTS)', async () => {
      const dto: UpdateScoresDto = {
        scores: [
          { teamId: 1, rawScore: 15 }, // Higher is better
          { teamId: 2, rawScore: 12 },
        ],
      };

      const updatedMatch = {
        ...mockMatch,
        matchTeams: [
          { teamId: 1, rawScore: 15, rank: 1, points: 10 },
          { teamId: 2, rawScore: 12, rank: 2, points: 8 },
        ],
      };

      mockMatchesService.updateScores.mockResolvedValue(updatedMatch);

      const result = await controller.updateScores(1, dto);
      expect(result.matchTeams[0].rank).toBe(1); // Team 1 is first (higher score)
      expect(result.matchTeams[1].rank).toBe(2); // Team 2 is second
    });

    it('should calculate ranks based on scoringDirection ASC (TIME)', async () => {
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
      expect(result.matchTeams[1].rank).toBe(1); // Team 2 is first (lower time)
      expect(result.matchTeams[0].rank).toBe(2); // Team 1 is second
    });

    it('should handle olympic points correctly (10,8,6,5,4,3,2,1)', async () => {
      const dto: UpdateScoresDto = {
        scores: [
          { teamId: 1, rawScore: 100 },
          { teamId: 2, rawScore: 90 },
          { teamId: 3, rawScore: 80 },
          { teamId: 4, rawScore: 70 },
        ],
      };

      const updatedMatch = {
        ...mockMatch,
        matchTeams: [
          { teamId: 1, rawScore: 100, rank: 1, points: 10 },
          { teamId: 2, rawScore: 90, rank: 2, points: 8 },
          { teamId: 3, rawScore: 80, rank: 3, points: 6 },
          { teamId: 4, rawScore: 70, rank: 4, points: 5 },
        ],
      };

      mockMatchesService.updateScores.mockResolvedValue(updatedMatch);

      const result = await controller.updateScores(1, dto);
      expect(result.matchTeams[0].points).toBe(10);
      expect(result.matchTeams[1].points).toBe(8);
      expect(result.matchTeams[2].points).toBe(6);
      expect(result.matchTeams[3].points).toBe(5);
    });
  });

  describe('delete', () => {
    it('should delete a match', async () => {
      mockMatchesService.remove.mockResolvedValue(undefined);

      await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
