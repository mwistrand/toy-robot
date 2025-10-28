export type Direction = 'north' | 'east' | 'south' | 'west';
export type ClockDirection = 'clockwise' | 'counterclockwise';

export interface RobotPosition {
  id?: number;
  x: number;
  y: number;
  facing: Direction;
}
