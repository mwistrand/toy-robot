import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RobotModule } from './robot/robot.module';
import { RobotPosition } from './robot/robot-position.entity';
import { RobotController } from './robot/robot.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_PATH || 'robot.db',
      entities: [RobotPosition],
      synchronize: true,
    }),
    RobotModule,
  ],
  controllers: [RobotController],
  providers: []
})
export class AppModule {}
