import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { RobotService } from './robot.service';

describe('RobotService', () => {
  let service: RobotService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(RobotService);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up
    if (service['socket']) {
      service['socket'].disconnect();
    }
    // Clear localStorage after each test
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty offline queue', () => {
    // Clear any previous state
    localStorage.removeItem('robot-offline-queue');
    const freshService = TestBed.inject(RobotService);
    expect(freshService['offlineQueue'].length).toBe(0);
  });

  it('should save and load offline queue from localStorage', () => {
    const positions = [{ x: 1, y: 2, facing: 'north' as const }];
    service['offlineQueue'] = [{ positions, timestamp: Date.now() }];
    service['saveOfflineQueue']();

    const newService = TestBed.inject(RobotService);
    expect(newService['offlineQueue'].length).toBe(1);
    expect(newService['offlineQueue'][0].positions).toEqual(positions);
  });

  it('should clear queue when creating a new robot while offline', () => {
    service['offlineQueue'] = [
      { positions: [{ x: 1, y: 2, facing: 'north' as const }], timestamp: Date.now() },
    ];

    // Simulate offline state
    service['socket'].connected = false;
    service.createRobot();

    expect(service['offlineQueue'].length).toBe(0);
  });

  it('should queue positions when offline', () => {
    // Simulate offline state
    service['socket'].connected = false;
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: false,
    });

    const position = { x: 1, y: 2, facing: 'north' as const };
    service.updatePosition(position);

    expect(service['offlineQueue'].length).toBe(1);
    expect(service['offlineQueue'][0].positions).toEqual([position]);
  });
});
