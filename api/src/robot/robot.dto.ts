export interface RobotPositionDto {
  x: number;
  y: number;
  facing: 'north' | 'south' | 'east' | 'west';
}

export interface CreateRobotDto {
  // Currently no data needed, but keeping for future extensibility
}
