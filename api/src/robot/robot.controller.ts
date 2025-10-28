import { Controller, Get, Query } from '@nestjs/common';
import { RobotService } from './robot.service';
import { RobotPositionDto } from './robot.dto';

@Controller('robots')
export class RobotController {

  constructor(private readonly robotService: RobotService) {}

  @Get('history')
  getLatestHistory(@Query('count') count: number): Promise<RobotPositionDto[]> {
    return this.robotService.getLatestHistory(count);
  }
}

