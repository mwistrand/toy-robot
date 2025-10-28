import { Component, importProvidersFrom, OnInit, signal, ViewChild } from '@angular/core';
import { BehaviorSubject, take } from 'rxjs';
import { BoardComponent } from './robot/components/board.component';
import { RobotService } from './robot/services/robot.service';
import { RobotPosition } from './robot/models/robot.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [BoardComponent, CommonModule]
})
export class App implements OnInit {
  @ViewChild(BoardComponent)
  board?: BoardComponent;

  private historySubject = new BehaviorSubject<RobotPosition[]>([]);
  private historyErrorSubject = new BehaviorSubject<Error | null>(null);

  protected readonly history$ = this.historySubject.asObservable();
  protected readonly historyError$ = this.historyErrorSubject.asObservable();

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

  requestHistory() {
    this.robotService.getLatestHistory(10).pipe(take(1)).subscribe(
      (response) => {
        this.historySubject.next(response);
        this.historyErrorSubject.next(null);
      },
      (error) => {
        this.historySubject.next([]);
        this.historyErrorSubject.next(error);
      }
    );
  }
}


