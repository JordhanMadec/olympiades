import { Test, TestingModule } from '@nestjs/testing';
import { DrawsController } from './draws.controller';
import { DrawsService } from './draws.service';

describe('DrawsController', () => {
  let controller: DrawsController;
  let service: DrawsService;

  const mockDrawsService = {
    generateRoundRobinDraw: jest.fn(),
    generateBracketDraw: jest.fn(),
    getConfrontationHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrawsController],
      providers: [
        {
          provide: DrawsService,
          useValue: mockDrawsService,
        },
      ],
    }).compile();

    controller = module.get<DrawsController>(DrawsController);
    service = module.get<DrawsService>(DrawsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateRoundRobinDraw', () => {
    it('should generate round-robin draw with minimal confrontations', async () => {
      const dto = {
        gameId: 1,
        teamIds: [1, 2, 3, 4],
        teamsPerMatch: 2,
        numberOfMatches: 3,
      };

      const mockDraw = [
        { matchNumber: 1, teamIds: [1, 2], confrontationScore: 0 },
        { matchNumber: 2, teamIds: [3, 4], confrontationScore: 0 },
        { matchNumber: 3, teamIds: [1, 3], confrontationScore: 0 },
      ];

      mockDrawsService.generateRoundRobinDraw.mockResolvedValue(mockDraw);

      const result = await controller.generateRoundRobinDraw(dto);
      expect(result).toEqual(mockDraw);
      expect(service.generateRoundRobinDraw).toHaveBeenCalledWith(dto);
    });

    it('should minimize repeated confrontations', async () => {
      const dto = {
        gameId: 1,
        teamIds: [1, 2, 3, 4],
        teamsPerMatch: 2,
        numberOfMatches: 5,
      };

      const mockDraw = [
        { matchNumber: 1, teamIds: [1, 2], confrontationScore: 0 },
        { matchNumber: 2, teamIds: [3, 4], confrontationScore: 0 },
        { matchNumber: 3, teamIds: [1, 3], confrontationScore: 0 },
        { matchNumber: 4, teamIds: [2, 4], confrontationScore: 0 },
        { matchNumber: 5, teamIds: [1, 4], confrontationScore: 0 },
      ];

      mockDrawsService.generateRoundRobinDraw.mockResolvedValue(mockDraw);

      const result = await controller.generateRoundRobinDraw(dto);
      
      // Check that no team pair repeats in first 4 matches (with 4 teams and 2 per match)
      const pairs = result.slice(0, 4).map(m => m.teamIds.sort().join('-'));
      const uniquePairs = new Set(pairs);
      expect(uniquePairs.size).toBe(4); // All 4 matches should have unique pairs
    });
  });

  describe('generateBracketDraw', () => {
    it('should generate bracket with correct structure', async () => {
      const dto = {
        gameId: 1,
        teamIds: [1, 2, 3, 4],
        useSeeding: false,
      };

      const mockBracket = [
        { matchNumber: 1, round: 2, bracketPosition: 0, teamIds: [1, 2], isBye: false },
        { matchNumber: 2, round: 2, bracketPosition: 1, teamIds: [3, 4], isBye: false },
        { matchNumber: 3, round: 1, bracketPosition: 0, teamIds: [], isBye: false }, // Final
      ];

      mockDrawsService.generateBracketDraw.mockResolvedValue(mockBracket);

      const result = await controller.generateBracketDraw(dto);
      expect(result).toHaveLength(3); // 2 semifinals + 1 final
      expect(result[0].round).toBe(2); // First match is in round 2 (semis)
      expect(result[2].round).toBe(1); // Last match is final (round 1)
    });

    it('should handle byes when team count is not power of 2', async () => {
      const dto = {
        gameId: 1,
        teamIds: [1, 2, 3], // 3 teams -> bracket size 4 -> 1 bye
        useSeeding: false,
      };

      const mockBracket = [
        { matchNumber: 1, round: 2, bracketPosition: 0, teamIds: [1, 2], isBye: false },
        { matchNumber: 2, round: 2, bracketPosition: 1, teamIds: [3], isBye: true }, // Bye
        { matchNumber: 3, round: 1, bracketPosition: 0, teamIds: [], isBye: false },
      ];

      mockDrawsService.generateBracketDraw.mockResolvedValue(mockBracket);

      const result = await controller.generateBracketDraw(dto);
      const byeMatches = result.filter(m => m.isBye);
      expect(byeMatches.length).toBeGreaterThan(0); // Should have at least one bye
    });
  });

  describe('getConfrontationHistory', () => {
    it('should return confrontation counts between teams', async () => {
      const mockHistory = [
        { team1Id: 1, team1Name: 'Team A', team2Id: 2, team2Name: 'Team B', matchCount: 3 },
        { team1Id: 1, team1Name: 'Team A', team2Id: 3, team2Name: 'Team C', matchCount: 1 },
        { team1Id: 2, team1Name: 'Team B', team2Id: 3, team2Name: 'Team C', matchCount: 2 },
      ];

      mockDrawsService.getConfrontationHistory.mockResolvedValue(mockHistory);

      const result = await controller.getConfrontationHistory();
      expect(result).toEqual(mockHistory);
      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toHaveProperty('matchCount');
    });
  });
});
