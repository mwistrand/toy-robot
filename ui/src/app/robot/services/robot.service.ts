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
  }

  createRobot(): void {
    if (this.socket.connected) {
      this.socket.emit('createRobot', {});
    } else {
      console.warn('API not connected...');
    }
  }

  updatePosition(position: RobotPosition | RobotPosition[]): void {
    const positions = Array.isArray(position) ? position : [position];

    if (this.socket.connected && navigator.onLine) {
      this.socket.emit('updatePosition', positions);
    } else {
      console.warn('API not connected...');
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
}

