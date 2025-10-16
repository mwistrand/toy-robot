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
});

