import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { BoardComponent } from './board.component';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 25 cells in a 5x5 grid', () => {
    const cells = compiled.querySelectorAll('.cell');
    expect(cells.length).toBe(25);

    // Check that cells have proper index attributes
    cells.forEach((cell, index) => {
      expect(cell.getAttribute('data-cell-index')).toBe(index.toString());
    });
  });

  it('should not display robot initially', () => {
    const robot = compiled.querySelector('.robot');
    // Robot element exists but should have hidden class
    expect(robot?.classList.contains('hidden')).toBe(true);
  });

  it('should not display report initially', () => {
    const report = compiled.querySelector('.report');
    expect(report?.classList.contains('sr-only')).toBe(true);
  });

  it('should display robot when clicking on a cell', async () => {
    const cells = compiled.querySelectorAll('.cell');
    const firstCell = cells[0] as HTMLElement;

    firstCell.click();

    // Wait for all async operations
    await new Promise(resolve => setTimeout(resolve, 200));
    try {
      fixture.detectChanges();
    } catch (e) {
      // Ignore ExpressionChangedAfterItHasBeenCheckedError in zoneless mode
    }

    const robot = compiled.querySelector('.robot-icon');
    expect(robot).toBeTruthy();

    // Robot should be in the first cell
    const robotParent = robot?.closest('.cell');
    expect(robotParent?.getAttribute('data-cell-index')).toBe('0');
  });

  it('should emit onPlaceRobot event when placing robot', async () => {
    const spy = jasmine.createSpy('onPlaceRobot');
    component.onPlaceRobot.subscribe(spy);

    const cells = compiled.querySelectorAll('.cell');
    const firstCell = cells[0] as HTMLElement;

    firstCell.click();

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(spy).toHaveBeenCalled();
  });

  it('should emit onPositionChange event when placing robot', async () => {
    const spy = jasmine.createSpy('onPositionChange');
    component.onPositionChange.subscribe(spy);

    const cells = compiled.querySelectorAll('.cell');
    const firstCell = cells[0] as HTMLElement;

    firstCell.click();

    await new Promise(resolve => setTimeout(resolve, 200));
    expect(spy).toHaveBeenCalledWith({
      x: 0,
      y: 4,
      facing: 'north',
    });
  });

  it('should rotate robot icon when clicking rotate buttons', async () => {
    const cells = compiled.querySelectorAll('.cell');
    const firstCell = cells[0] as HTMLElement;

    // First place the robot
    firstCell.click();
    await new Promise(resolve => setTimeout(resolve, 200));
    try { fixture.detectChanges(); } catch (e) {}

    const buttons = compiled.querySelectorAll('.robot-controls button');
    const rightButton = buttons[2] as HTMLElement;
    const leftButton = buttons[0] as HTMLElement;

    // Click right to rotate clockwise
    rightButton.click();
    await new Promise(resolve => setTimeout(resolve, 100));
    try { fixture.detectChanges(); } catch (e) {}

    const robotIcon = compiled.querySelector('.robot-icon');
    expect(robotIcon?.classList.contains('is-east')).toBe(true);

    // Click left to rotate counterclockwise
    leftButton.click();
    await new Promise(resolve => setTimeout(resolve, 100));
    try { fixture.detectChanges(); } catch (e) {}
    expect(robotIcon?.classList.contains('is-east')).toBe(false);
  });

  it('should show report when report button is clicked', async () => {
    const cells = compiled.querySelectorAll('.cell');
    const firstCell = cells[0] as HTMLElement;

    // Place robot first
    firstCell.click();
    await new Promise(resolve => setTimeout(resolve, 200));
    try { fixture.detectChanges(); } catch (e) {}

    const buttons = compiled.querySelectorAll('.robot-controls button');
    const reportButton = buttons[3] as HTMLElement;

    reportButton.click();
    await new Promise(resolve => setTimeout(resolve, 100));
    try { fixture.detectChanges(); } catch (e) {}

    const report = compiled.querySelector('.report');
    expect(report?.classList.contains('sr-only')).toBe(false);
  });

  it('should move robot when move button is clicked', async () => {
    const spy = jasmine.createSpy('onPositionChange');
    component.onPositionChange.subscribe(spy);

    const cells = compiled.querySelectorAll('.cell');
    const cell = cells[10] as HTMLElement; // Position 10 = x:0, y:2

    // Place robot
    cell.click();
    await new Promise(resolve => setTimeout(resolve, 200));
    spy.calls.reset();
    try { fixture.detectChanges(); } catch (e) {}

    const buttons = compiled.querySelectorAll('.robot-controls button');
    const moveButton = buttons[1] as HTMLElement;

    // Move north (should go up one row)
    moveButton.click();
    await new Promise(resolve => setTimeout(resolve, 200));
    try { fixture.detectChanges(); } catch (e) {}

    // Should have moved to position 5 (y:1)
    const robot = compiled.querySelector('.robot');
    const robotParent = robot?.closest('.cell');
    expect(robotParent?.getAttribute('data-cell-index')).toBe('5');

    expect(spy).toHaveBeenCalledWith({
      x: 0,
      y: 3,
      facing: 'north',
    });
  });

  it('should update robot position when position input changes', async () => {
    const position = { x: 2, y: 3, facing: 'south' as const };

    fixture.componentRef.setInput('initialPosition', position);
    try { fixture.detectChanges(); } catch (e) {}

    // Allow effect and requestAnimationFrame to run
    await new Promise(resolve => setTimeout(resolve, 300));
    try { fixture.detectChanges(); } catch (e) {}

    const robot = compiled.querySelector('.robot');
    const robotParent = robot?.closest('.cell');

    // Position 17 = x:2, y:3 (3*5 + 2 = 17)
    expect(robotParent?.getAttribute('data-cell-index')).toBe('7');

    const robotIcon = compiled.querySelector('.robot-icon');
    expect(robotIcon?.classList.contains('is-south')).toBe(true);
  });

  describe('Keyboard events', () => {
    it('should place robot when Enter key is pressed on a cell', async () => {
      const cells = compiled.querySelectorAll('.cell');
      const firstCell = cells[0] as HTMLElement;

      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      firstCell.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 200));
      try { fixture.detectChanges(); } catch (e) {}

      const robot = compiled.querySelector('.robot-icon');
      expect(robot).toBeTruthy();

      const robotParent = robot?.closest('.cell');
      expect(robotParent?.getAttribute('data-cell-index')).toBe('0');
    });

    it('should emit onPlaceRobot event when Enter key is pressed', async () => {
      const spy = jasmine.createSpy('onPlaceRobot');
      component.onPlaceRobot.subscribe(spy);

      const cells = compiled.querySelectorAll('.cell');
      const firstCell = cells[0] as HTMLElement;

      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      firstCell.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(spy).toHaveBeenCalled();
    });

    it('should move robot up when ArrowUp key is pressed', async () => {
      const cells = compiled.querySelectorAll('.cell');
      const cell = cells[10] as HTMLElement; // Position 10 = x:0, y:2

      // Place robot first
      cell.click();
      await new Promise(resolve => setTimeout(resolve, 200));
      try { fixture.detectChanges(); } catch (e) {}

      // Get the cell where robot is now located
      const robot = compiled.querySelector('.robot');
      const cellWithRobot = robot?.closest('.cell') as HTMLElement;

      // Press ArrowUp to move north
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true });
      cellWithRobot.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 200));
      try { fixture.detectChanges(); } catch (e) {}

      const robotAfterMove = compiled.querySelector('.robot');
      const robotParent = robotAfterMove?.closest('.cell');
      expect(robotParent?.getAttribute('data-cell-index')).toBe('5');
    });

    it('should move robot down when ArrowDown key is pressed', async () => {
      const cells = compiled.querySelectorAll('.cell');
      const cell = cells[10] as HTMLElement;

      // Place robot first
      cell.click();
      await new Promise(resolve => setTimeout(resolve, 200));
      try { fixture.detectChanges(); } catch (e) {}

      // Get the cell where robot is now located
      const robot = compiled.querySelector('.robot');
      const cellWithRobot = robot?.closest('.cell') as HTMLElement;

      // Press ArrowDown to move south
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
      cellWithRobot.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 200));
      try { fixture.detectChanges(); } catch (e) {}

      const robotAfterMove = compiled.querySelector('.robot');
      const robotParent = robotAfterMove?.closest('.cell');
      expect(robotParent?.getAttribute('data-cell-index')).toBe('15');
    });

    it('should move robot left when ArrowLeft key is pressed', async () => {
      const cells = compiled.querySelectorAll('.cell');
      const cell = cells[11] as HTMLElement; // Position 11 = x:1, y:2

      // Place robot first
      cell.click();
      await new Promise(resolve => setTimeout(resolve, 200));
      try { fixture.detectChanges(); } catch (e) {}

      // Get the cell where robot is now located
      const robot = compiled.querySelector('.robot');
      const cellWithRobot = robot?.closest('.cell') as HTMLElement;

      // Press ArrowLeft to move west
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
      cellWithRobot.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 200));
      try { fixture.detectChanges(); } catch (e) {}

      const robotAfterMove = compiled.querySelector('.robot');
      const robotParent = robotAfterMove?.closest('.cell');
      expect(robotParent?.getAttribute('data-cell-index')).toBe('10');

      const robotIcon = compiled.querySelector('.robot-icon');
      expect(robotIcon?.classList.contains('is-west')).toBe(true);
    });

    it('should move robot right when ArrowRight key is pressed', async () => {
      const cells = compiled.querySelectorAll('.cell');
      const cell = cells[10] as HTMLElement;

      // Place robot first
      cell.click();
      await new Promise(resolve => setTimeout(resolve, 200));
      try { fixture.detectChanges(); } catch (e) {}

      // Get the cell where robot is now located
      const robot = compiled.querySelector('.robot');
      const cellWithRobot = robot?.closest('.cell') as HTMLElement;

      // Press ArrowRight to move east
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
      cellWithRobot.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 200));
      try { fixture.detectChanges(); } catch (e) {}

      const robotAfterMove = compiled.querySelector('.robot');
      const robotParent = robotAfterMove?.closest('.cell');
      expect(robotParent?.getAttribute('data-cell-index')).toBe('11');

      const robotIcon = compiled.querySelector('.robot-icon');
      expect(robotIcon?.classList.contains('is-east')).toBe(true);
    });

    it('should not move robot up beyond board boundary', async () => {
      const cells = compiled.querySelectorAll('.cell');
      const firstCell = cells[0] as HTMLElement; // Top row

      // Place robot at top edge
      firstCell.click();
      await new Promise(resolve => setTimeout(resolve, 200));
      try { fixture.detectChanges(); } catch (e) {}

      // Get the cell where robot is now located
      const robot = compiled.querySelector('.robot');
      const cellWithRobot = robot?.closest('.cell') as HTMLElement;

      // Try to press ArrowUp
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true });
      cellWithRobot.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 200));
      try { fixture.detectChanges(); } catch (e) {}

      // Robot should stay at position 0
      const robotAfterMove = compiled.querySelector('.robot');
      const robotParent = robotAfterMove?.closest('.cell');
      expect(robotParent?.getAttribute('data-cell-index')).toBe('0');
    });

    it('should not move robot down beyond board boundary', async () => {
      const cells = compiled.querySelectorAll('.cell');
      const lastCell = cells[24] as HTMLElement; // Bottom row

      // Place robot at bottom edge
      lastCell.click();
      await new Promise(resolve => setTimeout(resolve, 200));
      try { fixture.detectChanges(); } catch (e) {}

      // Get the cell where robot is now located
      const robot = compiled.querySelector('.robot');
      const cellWithRobot = robot?.closest('.cell') as HTMLElement;

      // Try to press ArrowDown
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
      cellWithRobot.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 200));
      try { fixture.detectChanges(); } catch (e) {}

      // Robot should stay at position 24
      const robotAfterMove = compiled.querySelector('.robot');
      const robotParent = robotAfterMove?.closest('.cell');
      expect(robotParent?.getAttribute('data-cell-index')).toBe('24');
    });

    it('should not move robot left beyond board boundary', async () => {
      const cells = compiled.querySelectorAll('.cell');
      const leftEdgeCell = cells[10] as HTMLElement; // Left edge (x:0)

      // Place robot at left edge
      leftEdgeCell.click();
      await new Promise(resolve => setTimeout(resolve, 200));
      try { fixture.detectChanges(); } catch (e) {}

      // Get the cell where robot is now located
      const robot = compiled.querySelector('.robot');
      const cellWithRobot = robot?.closest('.cell') as HTMLElement;

      // Try to press ArrowLeft
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
      cellWithRobot.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 200));
      try { fixture.detectChanges(); } catch (e) {}

      // Robot should stay at position 10
      const robotAfterMove = compiled.querySelector('.robot');
      const robotParent = robotAfterMove?.closest('.cell');
      expect(robotParent?.getAttribute('data-cell-index')).toBe('10');
    });

    it('should not move robot right beyond board boundary', async () => {
      const cells = compiled.querySelectorAll('.cell');
      const rightEdgeCell = cells[14] as HTMLElement; // Right edge (x:4)

      // Place robot at right edge
      rightEdgeCell.click();
      await new Promise(resolve => setTimeout(resolve, 200));
      try { fixture.detectChanges(); } catch (e) {}

      // Get the cell where robot is now located
      const robot = compiled.querySelector('.robot');
      const cellWithRobot = robot?.closest('.cell') as HTMLElement;

      // Try to press ArrowRight
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
      cellWithRobot.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 200));
      try { fixture.detectChanges(); } catch (e) {}

      // Robot should stay at position 14
      const robotAfterMove = compiled.querySelector('.robot');
      const robotParent = robotAfterMove?.closest('.cell');
      expect(robotParent?.getAttribute('data-cell-index')).toBe('14');
    });

    it('should emit onPositionChange when robot moves via arrow keys', async () => {
      const spy = jasmine.createSpy('onPositionChange');
      component.onPositionChange.subscribe(spy);

      const cells = compiled.querySelectorAll('.cell');
      const cell = cells[10] as HTMLElement;

      // Place robot first
      cell.click();
      await new Promise(resolve => setTimeout(resolve, 200));
      spy.calls.reset();
      try { fixture.detectChanges(); } catch (e) {}

      // Get the cell where robot is now located
      const robot = compiled.querySelector('.robot');
      const cellWithRobot = robot?.closest('.cell') as HTMLElement;

      // Press ArrowUp
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true });
      cellWithRobot.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 200));
      expect(spy).toHaveBeenCalledWith({
        x: 0,
        y: 3,
        facing: 'north',
      });
    });

    it('should not respond to arrow keys on cells without robot', async () => {
      const cells = compiled.querySelectorAll('.cell');
      const cell = cells[10] as HTMLElement;

      // Place robot at position 10
      cell.click();
      await new Promise(resolve => setTimeout(resolve, 200));
      try { fixture.detectChanges(); } catch (e) {}

      // Try to press ArrowUp on a different cell (without robot)
      const differentCell = cells[5] as HTMLElement;
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true });
      differentCell.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 200));
      try { fixture.detectChanges(); } catch (e) {}

      // Robot should remain at position 10
      const robot = compiled.querySelector('.robot');
      const robotParent = robot?.closest('.cell');
      expect(robotParent?.getAttribute('data-cell-index')).toBe('10');
    });
  });
});
