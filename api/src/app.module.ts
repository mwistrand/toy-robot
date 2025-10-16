import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
