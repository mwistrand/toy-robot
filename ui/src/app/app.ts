import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { take } from 'rxjs';
import { BoardComponent } from './robot/components/board.component';
import { RobotService } from './robot/services/robot.service';
import { RobotPosition } from './robot/models/robot.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [BoardComponent],
})
export class App implements OnInit {
  @ViewChild(BoardComponent)
  board?: BoardComponent;

  protected initialPosition = signal<RobotPosition | null>(null);

  constructor(private robotService: RobotService) {}

  ngOnInit() {
    // Get latest position on startup
    this.robotService.getLatestPosition().pipe(take(1)).subscribe((position) => {
      this.initialPosition.set(position);
    });
  }

  handlePositionChange(position: RobotPosition) {
    this.robotService.updatePosition(position);
  }

  handlePlaceRobot() {
    this.robotService.createRobot();
  }
}


