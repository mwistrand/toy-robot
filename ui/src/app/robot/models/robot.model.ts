export type Direction = 'north' | 'east' | 'south' | 'west';
export type ClockDirection = 'clockwise' | 'counterclockwise';

export interface RobotPosition {
  x: number;
  y: number;
  facing: Direction;
}
