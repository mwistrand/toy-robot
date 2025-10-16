import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RobotPosition } from './robot-position.entity';
import { RobotService } from './robot.service';
import { RobotGateway } from './robot.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([RobotPosition])],
  providers: [RobotService, RobotGateway],
  exports: [RobotService],
})
export class RobotModule {}
