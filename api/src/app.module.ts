import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RobotModule } from './robot/robot.module';
import { RobotPosition } from './robot/robot-position.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'robot.db',
      entities: [RobotPosition],
      synchronize: true,
    }),
    RobotModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
