import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entity for tracking robot position history.
 * 
 * Race conditions with auto-incrementing IDs are not applicable here since:
 * - There is only a single robot for a single user
 * - All updates happen sequentially through a single WebSocket connection
 * - No concurrent writes to the database are expected
 */
@Entity('robot_position')
export class RobotPosition {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Static robot ID. Currently always set to 1 since we only support a single robot.
   * This allows for efficient clearing of all positions for a robot.
   */
  @Column({ type: 'integer', default: 1 })
  robotId: number;

  @Column({ type: 'integer' })
  x: number;

  @Column({ type: 'integer' })
  y: number;

  @Column({ type: 'text' })
  facing: 'north' | 'south' | 'east' | 'west';

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
