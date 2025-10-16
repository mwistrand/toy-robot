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

  it('should display robot when clicking on a cell', (done) => {
    const cells = compiled.querySelectorAll('.cell');
    const firstCell = cells[0] as HTMLElement;
    
    firstCell.click();
    fixture.detectChanges();

    // Wait for async operations
    setTimeout(() => {
      fixture.detectChanges();
      const robot = compiled.querySelector('.robot-icon');
      expect(robot).toBeTruthy();
      
      // Robot should be in the first cell
      const robotParent = robot?.closest('.cell');
      expect(robotParent?.getAttribute('data-cell-index')).toBe('0');
      done();
    }, 100);
  });

  it('should emit onPlaceRobot event when placing robot', (done) => {
    const spy = jasmine.createSpy('onPlaceRobot');
    component.onPlaceRobot.subscribe(spy);
    
    const cells = compiled.querySelectorAll('.cell');
    const firstCell = cells[0] as HTMLElement;
    
    firstCell.click();
    
    setTimeout(() => {
      expect(spy).toHaveBeenCalled();
      done();
    }, 50);
  });

  it('should emit onPositionChange event when placing robot', (done) => {
    const spy = jasmine.createSpy('onPositionChange');
    component.onPositionChange.subscribe(spy);
    
    const cells = compiled.querySelectorAll('.cell');
    const firstCell = cells[0] as HTMLElement;
    
    firstCell.click();
    
    setTimeout(() => {
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith({
        x: 0,
        y: 0,
        facing: 'north',
      });
      done();
    }, 100);
  });

  it('should rotate robot icon when clicking rotate buttons', (done) => {
    const cells = compiled.querySelectorAll('.cell');
    const firstCell = cells[0] as HTMLElement;
    
    // First place the robot
    firstCell.click();
    
    setTimeout(() => {
      fixture.detectChanges();
      
      const buttons = compiled.querySelectorAll('.robot-controls button');
      const leftButton = buttons[0] as HTMLElement;
      const rightButton = buttons[2] as HTMLElement;
      
      // Click right to rotate clockwise
      rightButton.click();
      fixture.detectChanges();
      
      const robotIcon = compiled.querySelector('.robot-icon');
      expect(robotIcon?.classList.contains('is-east')).toBe(true);
      
      // Click left twice to rotate counterclockwise
      leftButton.click();
      fixture.detectChanges();
      expect(robotIcon?.classList.contains('is-east')).toBe(false);
      
      done();
    }, 100);
  });

  it('should show report when report button is clicked', (done) => {
    let latestPosition: any = null;
    component.onPositionChange.subscribe((pos) => {
      latestPosition = pos;
      // Update the position input to simulate the app component behavior
      fixture.componentRef.setInput('position', pos);
      fixture.detectChanges();
    });
    
    const cells = compiled.querySelectorAll('.cell');
    const firstCell = cells[0] as HTMLElement;
    
    // Place robot first
    firstCell.click();
    
    setTimeout(() => {
      fixture.detectChanges();
      
      const buttons = compiled.querySelectorAll('.robot-controls button');
      const reportButton = buttons[3] as HTMLElement;
      
      reportButton.click();
      fixture.detectChanges();
      
      const report = compiled.querySelector('.report');
      expect(report?.classList.contains('sr-only')).toBe(false);
      
      // Check that report contains position information
      const reportText = report?.textContent?.trim() || '';
      expect(reportText).toContain('robot');
      expect(reportText).toContain('north');
      
      done();
    }, 100);
  });

  it('should move robot when move button is clicked', (done) => {
    const spy = jasmine.createSpy('onPositionChange');
    component.onPositionChange.subscribe(spy);
    
    const cells = compiled.querySelectorAll('.cell');
    const cell = cells[10] as HTMLElement; // Position 10 = x:0, y:2
    
    // Place robot
    cell.click();
    
    setTimeout(() => {
      fixture.detectChanges();
      spy.calls.reset();
      
      const buttons = compiled.querySelectorAll('.robot-controls button');
      const moveButton = buttons[1] as HTMLElement;
      
      // Move north (should go up one row)
      moveButton.click();
      
      setTimeout(() => {
        fixture.detectChanges();
        
        // Should have moved to position 5 (y:1)
        const robot = compiled.querySelector('.robot');
        const robotParent = robot?.closest('.cell');
        expect(robotParent?.getAttribute('data-cell-index')).toBe('5');
        
        expect(spy).toHaveBeenCalledWith({
          x: 0,
          y: 1,
          facing: 'north',
        });
        
        done();
      }, 100);
    }, 100);
  });

  it('should update robot position when position input changes', (done) => {
    const position = { x: 2, y: 3, facing: 'south' as const };
    
    fixture.componentRef.setInput('position', position);
    fixture.detectChanges();

    // Allow effect to run
    setTimeout(() => {
      fixture.detectChanges();
      
      const robot = compiled.querySelector('.robot');
      const robotParent = robot?.closest('.cell');
      
      // Position 17 = x:2, y:3 (3*5 + 2 = 17)
      expect(robotParent?.getAttribute('data-cell-index')).toBe('17');
      
      const robotIcon = compiled.querySelector('.robot-icon');
      expect(robotIcon?.classList.contains('is-south')).toBe(true);
      
      done();
    }, 150);
  });
});
