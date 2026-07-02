import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { RankingsController } from './rankings.controller';
import { RankingsService } from './rankings.service';

describe('RankingsController', () => {
  let app: INestApplication;
  let rankingsService: RankingsService;

  const mockRankingsService = {
    getGeneralRanking: jest.fn(),
    getRankingByGame: jest.fn(),
    getAllGameRankings: jest.fn(),
  };

  const mockGeneralRanking = {
    gameName: 'Classement Général',
    entries: [
      { teamId: 1, teamName: 'Team A', teamColor: '#FF0000', totalPoints: 30, matchesPlayed: 5 },
      { teamId: 2, teamName: 'Team B', teamColor: '#00FF00', totalPoints: 25, matchesPlayed: 5 },
      { teamId: 3, teamName: 'Team C', teamColor: '#0000FF', totalPoints: 20, matchesPlayed: 5 },
    ],
  };

  const mockGameRanking = {
    gameId: 1,
    gameName: 'Babyfoot',
    entries: [
      { teamId: 1, teamName: 'Team A', teamColor: '#FF0000', totalPoints: 10, matchesPlayed: 2 },
      { teamId: 2, teamName: 'Team B', teamColor: '#00FF00', totalPoints: 8, matchesPlayed: 2 },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RankingsController],
      providers: [
        {
          provide: RankingsService,
          useValue: mockRankingsService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    rankingsService = module.get<RankingsService>(RankingsService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/rankings/general', () => {
    it('should return general ranking', () => {
      mockRankingsService.getGeneralRanking.mockResolvedValue(mockGeneralRanking);

      return request(app.getHttpServer())
        .get('/api/rankings/general')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('entries');
          expect(res.body.entries).toBeInstanceOf(Array);
          expect(res.body.entries).toHaveLength(3);
          expect(res.body.entries[0]).toHaveProperty('teamName', 'Team A');
          expect(res.body.entries[0]).toHaveProperty('totalPoints', 30);
        });
    });

    it('should return empty ranking when no matches played', () => {
      mockRankingsService.getGeneralRanking.mockResolvedValue({ entries: [] });

      return request(app.getHttpServer())
        .get('/api/rankings/general')
        .expect(200)
        .expect((res) => {
          expect(res.body.entries).toEqual([]);
        });
    });
  });

  describe('GET /api/rankings/game/:gameId', () => {
    it('should return ranking for specific game', () => {
      mockRankingsService.getRankingByGame.mockResolvedValue(mockGameRanking);

      return request(app.getHttpServer())
        .get('/api/rankings/game/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('gameId', 1);
          expect(res.body).toHaveProperty('gameName', 'Babyfoot');
          expect(res.body.entries).toHaveLength(2);
        });
    });

    it('should return 400 for invalid game ID', () => {
      return request(app.getHttpServer())
        .get('/api/rankings/game/invalid')
        .expect(400);
    });
  });

  describe('GET /api/rankings/games', () => {
    it('should return rankings for all games', () => {
      const mockAllRankings = [mockGameRanking, { ...mockGameRanking, gameId: 2, gameName: 'Course' }];
      mockRankingsService.getAllGameRankings.mockResolvedValue(mockAllRankings);

      return request(app.getHttpServer())
        .get('/api/rankings/games')
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body).toHaveLength(2);
          expect(res.body[0]).toHaveProperty('gameName', 'Babyfoot');
          expect(res.body[1]).toHaveProperty('gameName', 'Course');
        });
    });

    it('should return empty array when no games exist', () => {
      mockRankingsService.getAllGameRankings.mockResolvedValue([]);

      return request(app.getHttpServer())
        .get('/api/rankings/games')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([]);
        });
    });
  });

  describe('Rankings ordering', () => {
    it('should return teams ordered by totalPoints DESC', () => {
      mockRankingsService.getGeneralRanking.mockResolvedValue(mockGeneralRanking);

      return request(app.getHttpServer())
        .get('/api/rankings/general')
        .expect(200)
        .expect((res) => {
          const entries = res.body.entries;
          expect(entries[0].totalPoints).toBeGreaterThanOrEqual(entries[1].totalPoints);
          expect(entries[1].totalPoints).toBeGreaterThanOrEqual(entries[2].totalPoints);
        });
    });
  });
});
