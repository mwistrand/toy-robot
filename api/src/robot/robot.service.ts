import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RobotPosition } from './robot-position.entity';
import { RobotPositionDto } from './robot.dto';

@Injectable()
export class RobotService {
  constructor(
    @InjectRepository(RobotPosition)
    private robotPositionRepository: Repository<RobotPosition>,
  ) {}

  /**
   * Create a new robot by clearing all existing position history.
   * <p>
   * Performance note: Since we only have a single robot for a single user,
   * clearing the entire table is the most efficient approach. An indexed
   * delete by robotId would only be beneficial with multiple robots, which
   * is not the current use case. The TRUNCATE-equivalent operation (DELETE
   * with no WHERE clause) is optimized by SQLite and is faster than indexed
   * deletes for clearing all data.
   */
  async createRobot(): Promise<void> {
    await this.robotPositionRepository.clear();
  }

  /**
   * Add one or more position entries for the robot.
   */
  async addPositions(
    positions: RobotPositionDto | RobotPositionDto[],
  ): Promise<void> {
    const positionsArray = Array.isArray(positions) ? positions : [positions];
    const entities = positionsArray.map((pos) => ({
      robotId: 1,
      x: pos.x,
      y: pos.y,
      facing: pos.facing,
    }));
    await this.robotPositionRepository.save(entities);
  }

  /**
   * Get the latest position of the robot.
   */
  async getLatestPosition(): Promise<RobotPositionDto | null> {
    const position = await this.robotPositionRepository.findOne({
      where: { robotId: 1 },
      order: { id: 'DESC' },
    });

    if (!position) {
      return null;
    }

    return {
      id: position.id,
      x: position.x,
      y: position.y,
      facing: position.facing,
    };
  }

  async getLatestHistory(count: number): Promise<RobotPositionDto[]> {
    const [result] = await this.robotPositionRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: count
    });
    const dtos = result.map(({ id, x, y, facing }) => ({ id, x, y, facing }));
    // Reverse the result so that the latest position is last in the list.
    dtos.reverse();
    return dtos;
  }
}
