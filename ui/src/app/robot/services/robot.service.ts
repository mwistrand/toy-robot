import { inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, fromEvent, of } from 'rxjs';
import { RobotPosition } from '../models/robot.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RobotService {
  private http = inject(HttpClient);

  private serviceHost: string;
  private socket: Socket;

  constructor() {
    // Use relative path in production, absolute in development
    this.serviceHost = window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : window.location.origin;

    this.socket = io(this.serviceHost, {
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

  getLatestHistory(count = 10): Observable<RobotPosition[]> {
    return this.http.get<RobotPosition[]>(`${this.serviceHost}/robots/history?count=${count}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
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

