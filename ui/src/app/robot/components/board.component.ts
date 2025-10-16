import {
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
  input,
  effect,
  output,
  signal,
  untracked,
} from '@angular/core';
import { Direction, ClockDirection, RobotPosition } from '../models/robot.model';

const INDEX_ATTRIBUTE = 'data-cell-index';
const POSITION_CLASSES = ['is-east', 'is-west', 'is-south'];

const nextRotatedDirectionMap: Record<Direction, Direction[]> = {
  west: ['south', 'north'],
  east: ['north', 'south'],
  north: ['west', 'east'],
  south: ['east', 'west'],
};

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrl: './board.component.css',
  standalone: true,
})
export class BoardComponent {
  position = input<RobotPosition | null>(null);
  onPositionChange = output<RobotPosition>();
  onPlaceRobot = output<void>();

  private currentDirection: Direction = 'north';
  private currentIndex = -1;

  @ViewChild('report')
  protected report?: ElementRef;

  @ViewChild('robot')
  protected robot?: ElementRef;

  @ViewChildren('cell')
  protected cellRefs?: QueryList<ElementRef>;

  protected isReportDisplayed = signal<boolean>(false);

  protected columns = Array.from({ length: 5 });
  protected rows = Array.from({ length: 5 });
  protected cells = Array.from({ length: 25 });

  private MAX_CELL_INDEX = this.rows.length * this.columns.length - 1;

  protected isRobotDisplayed = signal<boolean>(false);

  constructor() {
    // React to position changes
    effect(() => {
      const pos = this.position();
      if (pos) {
        const index = pos.y * this.columns.length + pos.x;
        this.currentIndex = index;
        requestAnimationFrame(() => {
          const cell = this.getCellByIndex(index);
          this.setRobotPlacement(cell as HTMLElement, pos.facing);
        });
      }
    });
  }

  private get icon(): HTMLElement | undefined {
    return this.robot?.nativeElement.querySelector('.robot-icon');
  }

  protected placeRobot(event: Event) {
    if (event instanceof KeyboardEvent) {
      return this.handleKeyDown(event as KeyboardEvent);
    }
    this.handleClick(event);
  }

  protected moveRobot(): void {
    const cell = this.getCellByIndex(this.currentIndex);
    if (!cell) {
      return;
    }
    switch (this.currentDirection) {
      case 'north':
        return this.moveRobotUp(cell);
      case 'south':
        return this.moveRobotDown(cell);
      case 'west':
        return this.moveRobotLeft(cell);
      case 'east':
        return this.moveRobotRight(cell);
    }
  }

  protected reportPosition(displayReport = false): void {
    this.isReportDisplayed.set(displayReport);
  }

  protected rotateRobot(direction: ClockDirection) {
    const currentDirectionOptions = nextRotatedDirectionMap[this.currentDirection];
    const optionIndex = direction === 'counterclockwise' ? 0 : 1;
    this.currentDirection = currentDirectionOptions[optionIndex];
    this.setDirection(this.currentDirection);
    this.emitPositionChange();
  }

  protected setDirection(direction: Direction) {
    const { icon } = this;
    this.currentDirection = direction;
    if (!icon) {
      return;
    }
    POSITION_CLASSES.forEach((positionClass) => {
      if (positionClass.endsWith(direction)) {
        icon.classList.add(positionClass);
      } else {
        icon.classList.remove(positionClass);
      }
    });
  }

  private setRobotPlacement(cell: HTMLElement, direction: Direction = 'north') {
    this.currentDirection = direction;
    this.setDirection(direction);
    this.displayRobot(cell);
  }

  private handleClick(event: Event): void {
    const target = event.target as HTMLElement;
    this.setRobotPlacement(target.closest('.cell') as HTMLElement);
    this.onPlaceRobot.emit();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const cell = target.closest('.cell') as HTMLElement;
    switch (event.key) {
      case 'Enter':
        this.onPlaceRobot.emit();
        return this.displayRobot(cell);
      case 'ArrowUp':
        event.preventDefault();
        return this.moveRobotUp(cell);
      case 'ArrowDown':
        event.preventDefault();
        return this.moveRobotDown(cell);
      case 'ArrowLeft':
        event.preventDefault();
        return this.moveRobotLeft(cell);
      case 'ArrowRight':
        event.preventDefault();
        return this.moveRobotRight(cell);
    }
  }

  private moveRobotUp(cell: HTMLElement | null) {
    if (!untracked(this.isRobotDisplayed)) {
      return;
    }
    if (!cell || !this.robot) {
      return;
    }
    const currentIndex = parseInt(cell.getAttribute(INDEX_ATTRIBUTE) ?? '-1', 10);
    if (currentIndex < 0) {
      console.error('Logic error: cell is missing index attribute');
    }
    const previousIndex = currentIndex - this.columns.length;
    if (previousIndex < 0) {
      return;
    }
    this.setDirection('north');
    this.displayRobot(this.getCellByIndex(previousIndex));
  }

  private moveRobotDown(cell: HTMLElement | null) {
    if (!untracked(this.isRobotDisplayed)) {
      return;
    }
    if (!cell || !this.robot) {
      return;
    }
    const currentIndex = parseInt(cell.getAttribute(INDEX_ATTRIBUTE) ?? '-1', 10);
    if (currentIndex < 0) {
      console.error('Logic error: cell is missing index attribute');
    }
    const nextIndex = currentIndex + this.columns.length;
    if (nextIndex > this.MAX_CELL_INDEX) {
      return;
    }
    this.setDirection('south');
    this.displayRobot(this.getCellByIndex(nextIndex));
  }

  private moveRobotLeft(cell: HTMLElement | null) {
    if (!untracked(this.isRobotDisplayed)) {
      return;
    }
    if (!cell || !this.robot) {
      return;
    }
    const currentIndex = parseInt(cell.getAttribute(INDEX_ATTRIBUTE) ?? '-1', 10);
    if (currentIndex < 0) {
      console.error('Logic error: cell is missing index attribute');
    }
    if (currentIndex % this.columns.length === 0) {
      return;
    }
    const previousIndex = currentIndex - 1;
    this.setDirection('west');
    this.displayRobot(this.getCellByIndex(previousIndex));
  }

  private moveRobotRight(cell: HTMLElement | null) {
    if (!untracked(this.isRobotDisplayed)) {
      return;
    }
    if (!cell || !this.robot) {
      return;
    }
    const currentIndex = parseInt(cell.getAttribute(INDEX_ATTRIBUTE) ?? '-1', 10);
    if (currentIndex < 0) {
      console.error('Logic error: cell is missing index attribute');
    }
    if ((currentIndex + 1) % this.columns.length === 0) {
      return;
    }
    const nextIndex = currentIndex + 1;
    this.setDirection('east');
    this.displayRobot(this.getCellByIndex(nextIndex));
  }

  private getCellByIndex(index: number): HTMLElement | undefined {
    return this.cellRefs?.get(index)?.nativeElement;
  }

  private displayRobot(cell: HTMLElement | undefined | null) {
    if (!cell || !this.robot) {
      return;
    }

    cell.focus();
    this.isRobotDisplayed.set(true);
    requestAnimationFrame(() => {
      this.displayRobotAtCell(cell);
    });
  }

  private displayRobotAtCell(cell: HTMLElement) {
    const { icon } = this;
    if (!icon) {
      return;
    }

    cell.appendChild(this.robot?.nativeElement);
    this.currentIndex = parseInt(cell.getAttribute(INDEX_ATTRIBUTE) ?? '-1', 10);
    this.emitPositionChange();
  }

  private emitPositionChange() {
    if (this.currentIndex >= 0) {
      const x = this.currentIndex % this.columns.length;
      const y = Math.floor(this.currentIndex / this.columns.length);
      this.onPositionChange.emit({
        x,
        y,
        facing: this.currentDirection,
      });
    }
  }
}

