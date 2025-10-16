import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RobotService } from './robot.service';
import { RobotPosition } from './robot-position.entity';

describe('RobotService', () => {
  let service: RobotService;
  let repository: Repository<RobotPosition>;

  const mockRepository = {
    clear: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RobotService,
        {
          provide: getRepositoryToken(RobotPosition),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RobotService>(RobotService);
    repository = module.get<Repository<RobotPosition>>(
      getRepositoryToken(RobotPosition),
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRobot', () => {
    it('should clear all position history', async () => {
      await service.createRobot();
      expect(mockRepository.clear).toHaveBeenCalled();
    });
  });

  describe('addPositions', () => {
    it('should add a single position', async () => {
      const position = { x: 0, y: 0, facing: 'north' as const };
      await service.addPositions(position);

      expect(mockRepository.save).toHaveBeenCalledWith([
        {
          robotId: 1,
          x: 0,
          y: 0,
          facing: 'north',
        },
      ]);
    });

    it('should add multiple positions', async () => {
      const positions = [
        { x: 0, y: 0, facing: 'north' as const },
        { x: 1, y: 0, facing: 'east' as const },
      ];
      await service.addPositions(positions);

      expect(mockRepository.save).toHaveBeenCalledWith([
        { robotId: 1, x: 0, y: 0, facing: 'north' },
        { robotId: 1, x: 1, y: 0, facing: 'east' },
      ]);
    });
  });

  describe('getLatestPosition', () => {
    it('should return the latest position', async () => {
      const mockPosition = {
        id: 1,
        robotId: 1,
        x: 2,
        y: 3,
        facing: 'south' as const,
        createdAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockPosition);

      const result = await service.getLatestPosition();

      expect(result).toEqual({
        x: 2,
        y: 3,
        facing: 'south',
      });

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { robotId: 1 },
        order: { id: 'DESC' },
      });
    });

    it('should return null when no position exists', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getLatestPosition();

      expect(result).toBeNull();
    });
  });
});
