import { Component, ElementRef, inject, NgZone, QueryList, signal, untracked, ViewChild, ViewChildren } from '@angular/core';

const INDEX_ATTRIBUTE = 'data-cell-index';
const POSITION_CLASSES = ['is-east', 'is-west', 'is-south'];

const nextRotatedDirectionMap: Record<Direction, Direction[]> = {
  west: ['south', 'north'],
  east: ['north', 'south'],
  north: ['west', 'east'],
  south: ['east', 'west'],
};

export type Direction = 'north' | 'east' | 'south' | 'west';
export type ClockDirection = 'clockwise' | 'counterclockwise';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private currentDirection: Direction = 'north';
  private currentIndex = -1;

  @ViewChild('report')
  protected report?: ElementRef;

  @ViewChild('robot')
  protected robot?: ElementRef;

  @ViewChildren('cell')
  protected cellRefs?: QueryList<ElementRef>;

  private zone = inject(NgZone);

  protected isReportDisplayed = signal<boolean>(false);
  protected info = signal<{ x: number; y: number; f: Direction; } | undefined>(undefined);

  protected columns = Array.from({ length: 5 });
  protected rows = Array.from({ length: 5 });
  protected cells = Array.from({ length: 25 });

  private MAX_CELL_INDEX = this.rows.length * this.columns.length - 1;

  protected isRobotDisplayed = signal<boolean>(false);

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
  }

  protected setDirection(direction: Direction) {
    const { icon } = this;
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

  private handleClick(event: Event): void {
    const target = event.target as HTMLElement;
    this.currentDirection = 'north';
    this.setDirection(this.currentDirection);
    this.displayRobot(target.closest('.cell') as HTMLElement);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const cell = target.closest('.cell') as HTMLElement;
    switch (event.key) {
      case 'Enter':
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
      // The robot is already in the top row and therefore cannot move up any further.
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
      // The robot is already in the bottom row and therefore cannot move down any further.
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
      // The robot is already in the left-most column and therefore cannot move left any further.
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
      // The robot is already in the right-most column and therefore cannot move right any further.
      return;
    }
    const nextIndex = currentIndex + 1;
    this.setDirection('east');
    this.displayRobot(this.getCellByIndex(nextIndex));
  }

  private getCellByIndex(index: number): HTMLElement | undefined {
    // QueryList is ordered by the *projection* of elements onto Angular's render tree,
    // not the actual DOM order. However, since the number of columns and rows is not
    // determined dynamically, we can assume that the QueryList order matches the render
    // order. In this case, it is safe to get cells directly by their index, instead of
    // being forced to make calls to the DOM's querySelectorAll method.
    return this.cellRefs?.get(index)?.nativeElement;
  }

  private displayRobot(cell: HTMLElement | undefined | null) {
    if (!cell || !this.robot) {
      return;
    }

    cell.focus();
    this.isRobotDisplayed.set(true);
    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        const { icon } = this;
        if (!icon) {
          return;
        }

        cell.appendChild(this.robot?.nativeElement);
        // const { height: robotHeight, width: robotWidth } = icon.getBoundingClientRect();
        // icon.style.top = (top + height / 2) - (robotHeight / 2) + 'px';
        // icon.style.left = (left + width / 2) - (robotWidth / 2) + 'px';

        // const message = this.robot!.nativeElement.querySelector('.robot-label');
        // message.textContent = `Robot moved to cell ${cell.getAttribute('data-cell-index')}`;

        this.currentIndex = parseInt(cell.getAttribute(INDEX_ATTRIBUTE) ?? '-1', 10);
      });
    });
  }
}

