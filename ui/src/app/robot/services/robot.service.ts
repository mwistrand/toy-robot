import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, fromEvent, BehaviorSubject } from 'rxjs';
import { RobotPosition } from '../models/robot.model';

interface QueuedUpdate {
  positions: RobotPosition[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class RobotService {
  private socket: Socket;
  private offlineQueue: QueuedUpdate[] = [];
  private readonly STORAGE_KEY = 'robot-offline-queue';
  private isOnline$ = new BehaviorSubject<boolean>(navigator.onLine);

  constructor() {
    // Use relative path in production, absolute in development
    const socketUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : window.location.origin;

    this.socket = io(socketUrl, {
      autoConnect: true,
    });

    // Load any queued updates from local storage
    this.loadOfflineQueue();

    // Monitor online/offline status
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Process queue when connection is established
    this.socket.on('connect', () => {
      this.processOfflineQueue();
    });
  }

  createRobot(): void {
    if (this.socket.connected) {
      this.socket.emit('createRobot', {});
    } else {
      // Clear queue when creating a new robot
      this.offlineQueue = [];
      this.saveOfflineQueue();
    }
  }

  updatePosition(position: RobotPosition | RobotPosition[]): void {
    const positions = Array.isArray(position) ? position : [position];

    if (this.socket.connected && navigator.onLine) {
      this.socket.emit('updatePosition', positions);
    } else {
      // Queue update for later
      this.offlineQueue.push({
        positions,
        timestamp: Date.now(),
      });
      this.saveOfflineQueue();
    }
  }

  getLatestPosition(): Observable<RobotPosition | null> {
    this.socket.emit('getLatestPosition');
    return fromEvent<RobotPosition | null>(this.socket, 'latestPosition');
  }

  onPositionUpdated(): Observable<RobotPosition | null> {
    return fromEvent<RobotPosition | null>(this.socket, 'positionUpdated');
  }

  onRobotCreated(): Observable<{ success: boolean }> {
    return fromEvent<{ success: boolean }>(this.socket, 'robotCreated');
  }

  private handleOnline(): void {
    this.isOnline$.next(true);
    if (this.socket.connected) {
      this.processOfflineQueue();
    }
  }

  private handleOffline(): void {
    this.isOnline$.next(false);
  }

  private processOfflineQueue(): void {
    if (this.offlineQueue.length === 0) {
      return;
    }

    // Send all queued positions in order
    const allPositions = this.offlineQueue.flatMap((item) => item.positions);
    if (allPositions.length > 0) {
      this.socket.emit('updatePosition', allPositions);
    }

    // Clear the queue
    this.offlineQueue = [];
    this.saveOfflineQueue();
  }

  private saveOfflineQueue(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.offlineQueue));
    } catch (e) {
      console.error('Failed to save offline queue to localStorage', e);
    }
  }

  private loadOfflineQueue(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load offline queue from localStorage', e);
      this.offlineQueue = [];
    }
  }
}

