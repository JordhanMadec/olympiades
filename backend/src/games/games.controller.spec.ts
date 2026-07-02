import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GameType, GameFormat, ScoringDirection } from './game.enums';

describe('GamesController', () => {
  let controller: GamesController;
  let service: GamesService;

  const mockGamesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockGame = {
    id: 1,
    name: 'Babyfoot',
    description: 'Match de babyfoot en 2v2',
    rules: 'Premier à 10 buts',
    gameType: GameType.SCORE,
    gameFormat: GameFormat.ROUND_ROBIN,
    scoringDirection: ScoringDirection.DESC,
    teamsPerMatch: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        {
          provide: GamesService,
          useValue: mockGamesService,
        },
      ],
    }).compile();

    controller = module.get<GamesController>(GamesController);
    service = module.get<GamesService>(GamesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a game with SCORE type', async () => {
      const dto: CreateGameDto = {
        name: 'Babyfoot',
        description: 'Match de babyfoot en 2v2',
        rules: 'Premier à 10 buts',
        gameType: GameType.SCORE,
        gameFormat: GameFormat.ROUND_ROBIN,
        scoringDirection: ScoringDirection.DESC,
        teamsPerMatch: 2,
      };

      mockGamesService.create.mockResolvedValue(mockGame);

      const result = await controller.create(dto);
      expect(result).toEqual(mockGame);
      expect(result.scoringDirection).toBe(ScoringDirection.DESC);
    });

    it('should create a TIME game with ASC scoring', async () => {
      const dto: CreateGameDto = {
        name: 'Course relais',
        description: 'Course par équipe',
        rules: 'Le plus rapide gagne',
        gameType: GameType.TIME,
        gameFormat: GameFormat.ROUND_ROBIN,
        scoringDirection: ScoringDirection.ASC,
        teamsPerMatch: 4,
      };

      const timeGame = {
        ...mockGame,
        name: 'Course relais',
        gameType: GameType.TIME,
        scoringDirection: ScoringDirection.ASC,
      };

      mockGamesService.create.mockResolvedValue(timeGame);

      const result = await controller.create(dto);
      expect(result.gameType).toBe(GameType.TIME);
      expect(result.scoringDirection).toBe(ScoringDirection.ASC);
    });

    it('should create an ELIMINATION format game', async () => {
      const dto: CreateGameDto = {
        name: 'Tournoi bracket',
        description: 'Tournoi à élimination directe',
        rules: 'Single elimination',
        gameType: GameType.SCORE,
        gameFormat: GameFormat.ELIMINATION,
        scoringDirection: ScoringDirection.DESC,
        teamsPerMatch: 2,
      };

      const bracketGame = {
        ...mockGame,
        gameFormat: GameFormat.ELIMINATION,
      };

      mockGamesService.create.mockResolvedValue(bracketGame);

      const result = await controller.create(dto);
      expect(result.gameFormat).toBe(GameFormat.ELIMINATION);
    });
  });

  describe('findAll', () => {
    it('should return array of games', async () => {
      const games = [
        mockGame,
        { ...mockGame, id: 2, name: 'Course', gameType: GameType.TIME },
      ];
      mockGamesService.findAll.mockResolvedValue(games);

      const result = await controller.findAll();
      expect(result).toEqual(games);
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return a game by id', async () => {
      mockGamesService.findOne.mockResolvedValue(mockGame);

      const result = await controller.findOne(1);
      expect(result).toEqual(mockGame);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update game properties', async () => {
      const dto: UpdateGameDto = {
        rules: 'Premier à 15 buts',
      };

      const updatedGame = { ...mockGame, rules: 'Premier à 15 buts' };
      mockGamesService.update.mockResolvedValue(updatedGame);

      const result = await controller.update(1, dto);
      expect(result.rules).toBe('Premier à 15 buts');
    });

    it('should allow changing game type and scoring direction', async () => {
      const dto: UpdateGameDto = {
        gameType: GameType.POINTS,
        scoringDirection: ScoringDirection.DESC,
      };

      const updatedGame = {
        ...mockGame,
        gameType: GameType.POINTS,
        scoringDirection: ScoringDirection.DESC,
      };
      mockGamesService.update.mockResolvedValue(updatedGame);

      const result = await controller.update(1, dto);
      expect(result.gameType).toBe(GameType.POINTS);
      expect(result.scoringDirection).toBe(ScoringDirection.DESC);
    });
  });

  describe('remove', () => {
    it('should delete a game', async () => {
      mockGamesService.remove.mockResolvedValue(undefined);

      await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
