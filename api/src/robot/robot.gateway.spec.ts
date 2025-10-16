import { Test, TestingModule } from '@nestjs/testing';
import { RobotGateway } from './robot.gateway';
import { RobotService } from './robot.service';

describe('RobotGateway', () => {
  let gateway: RobotGateway;
  let service: RobotService;

  const mockRobotService = {
    createRobot: jest.fn(),
    addPositions: jest.fn(),
    getLatestPosition: jest.fn(),
  };

  const mockClient = {
    emit: jest.fn(),
  };

  const mockServer = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RobotGateway,
        {
          provide: RobotService,
          useValue: mockRobotService,
        },
      ],
    }).compile();

    gateway = module.get<RobotGateway>(RobotGateway);
    service = module.get<RobotService>(RobotService);
    gateway.server = mockServer as any;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleCreateRobot', () => {
    it('should create a robot and emit success', async () => {
      await gateway.handleCreateRobot({}, mockClient as any);

      expect(mockRobotService.createRobot).toHaveBeenCalled();
      expect(mockClient.emit).toHaveBeenCalledWith('robotCreated', {
        success: true,
      });
    });
  });

  describe('handleUpdatePosition', () => {
    it('should update position and broadcast the latest', async () => {
      const position = { x: 1, y: 2, facing: 'north' as const };
      const latestPosition = { x: 1, y: 2, facing: 'north' as const };

      mockRobotService.addPositions.mockResolvedValue(undefined);
      mockRobotService.getLatestPosition.mockResolvedValue(latestPosition);

      await gateway.handleUpdatePosition(position, mockClient as any);

      expect(mockRobotService.addPositions).toHaveBeenCalledWith(position);
      expect(mockRobotService.getLatestPosition).toHaveBeenCalled();
      expect(mockServer.emit).toHaveBeenCalledWith(
        'positionUpdated',
        latestPosition,
      );
    });

    it('should handle multiple positions', async () => {
      const positions = [
        { x: 1, y: 2, facing: 'north' as const },
        { x: 2, y: 2, facing: 'east' as const },
      ];
      const latestPosition = { x: 2, y: 2, facing: 'east' as const };

      mockRobotService.addPositions.mockResolvedValue(undefined);
      mockRobotService.getLatestPosition.mockResolvedValue(latestPosition);

      await gateway.handleUpdatePosition(positions, mockClient as any);

      expect(mockRobotService.addPositions).toHaveBeenCalledWith(positions);
      expect(mockServer.emit).toHaveBeenCalledWith(
        'positionUpdated',
        latestPosition,
      );
    });
  });

  describe('handleGetLatestPosition', () => {
    it('should emit the latest position to the client', async () => {
      const latestPosition = { x: 3, y: 4, facing: 'west' as const };
      mockRobotService.getLatestPosition.mockResolvedValue(latestPosition);

      await gateway.handleGetLatestPosition(mockClient as any);

      expect(mockRobotService.getLatestPosition).toHaveBeenCalled();
      expect(mockClient.emit).toHaveBeenCalledWith(
        'latestPosition',
        latestPosition,
      );
    });
  });
});
