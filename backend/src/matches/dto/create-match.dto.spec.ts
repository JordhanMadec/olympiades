import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateMatchDto } from './create-match.dto';

describe('CreateMatchDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToInstance(CreateMatchDto, {
        gameId: 1,
        matchNumber: 1,
        teamIds: [1, 2],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with optional round and bracketPosition', async () => {
      const dto = plainToInstance(CreateMatchDto, {
        gameId: 1,
        matchNumber: 1,
        teamIds: [1, 2],
        round: 2,
        bracketPosition: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with single team (bye)', async () => {
      const dto = plainToInstance(CreateMatchDto, {
        gameId: 1,
        matchNumber: 1,
        teamIds: [1],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with multiple teams (4+)', async () => {
      const dto = plainToInstance(CreateMatchDto, {
        gameId: 1,
        matchNumber: 1,
        teamIds: [1, 2, 3, 4],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when gameId is missing', async () => {
      const dto = plainToInstance(CreateMatchDto, {
        matchNumber: 1,
        teamIds: [1, 2],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('gameId');
    });

    it('should fail validation when gameId is not an integer', async () => {
      const dto = plainToInstance(CreateMatchDto, {
        gameId: 'invalid',
        matchNumber: 1,
        teamIds: [1, 2],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('gameId');
    });

    it('should fail validation when gameId is less than 1', async () => {
      const dto = plainToInstance(CreateMatchDto, {
        gameId: 0,
        matchNumber: 1,
        teamIds: [1, 2],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('gameId');
    });

    it('should fail validation when matchNumber is missing', async () => {
      const dto = plainToInstance(CreateMatchDto, {
        gameId: 1,
        teamIds: [1, 2],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('matchNumber');
    });

    it('should fail validation when matchNumber is not an integer', async () => {
      const dto = plainToInstance(CreateMatchDto, {
        gameId: 1,
        matchNumber: 'invalid',
        teamIds: [1, 2],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('matchNumber');
    });

    it('should fail validation when teamIds is missing', async () => {
      const dto = plainToInstance(CreateMatchDto, {
        gameId: 1,
        matchNumber: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const teamIdsError = errors.find(e => e.property === 'teamIds');
      expect(teamIdsError).toBeDefined();
      expect(teamIdsError!.constraints).toHaveProperty('arrayMinSize');
    });

    it('should fail validation when teamIds is empty array', async () => {
      const dto = plainToInstance(CreateMatchDto, {
        gameId: 1,
        matchNumber: 1,
        teamIds: [],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const teamIdsError = errors.find(e => e.property === 'teamIds');
      expect(teamIdsError).toBeDefined();
      expect(teamIdsError!.constraints).toHaveProperty('arrayMinSize');
    });

    it('should fail validation when teamIds is not an array', async () => {
      const dto = plainToInstance(CreateMatchDto, {
        gameId: 1,
        matchNumber: 1,
        teamIds: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const teamIdsError = errors.find(e => e.property === 'teamIds');
      expect(teamIdsError).toBeDefined();
      expect(teamIdsError!.constraints).toHaveProperty('isArray');
    });

    it('should fail validation when teamIds contains non-integers', async () => {
      const dto = plainToInstance(CreateMatchDto, {
        gameId: 1,
        matchNumber: 1,
        teamIds: [1, 'two', 3],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const teamIdsError = errors.find(e => e.property === 'teamIds');
      expect(teamIdsError).toBeDefined();
      expect(teamIdsError!.constraints).toHaveProperty('isInt');
    });

    it('should fail validation when teamIds contains decimal numbers', async () => {
      const dto = plainToInstance(CreateMatchDto, {
        gameId: 1,
        matchNumber: 1,
        teamIds: [1, 2.5, 3],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const teamIdsError = errors.find(e => e.property === 'teamIds');
      expect(teamIdsError).toBeDefined();
    });

    it('should fail validation when round is not an integer', async () => {
      const dto = plainToInstance(CreateMatchDto, {
        gameId: 1,
        matchNumber: 1,
        teamIds: [1, 2],
        round: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('round');
    });

    it('should fail validation when bracketPosition is not an integer', async () => {
      const dto = plainToInstance(CreateMatchDto, {
        gameId: 1,
        matchNumber: 1,
        teamIds: [1, 2],
        bracketPosition: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('bracketPosition');
    });
  });
});
