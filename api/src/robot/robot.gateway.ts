import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RobotService } from './robot.service';
import { RobotPositionDto } from './robot.dto';
import type { CreateRobotDto } from './robot.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RobotGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly robotService: RobotService) {}

  @SubscribeMessage('createRobot')
  async handleCreateRobot(
    @MessageBody() data: CreateRobotDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Creating robot', data);
    await this.robotService.createRobot();
    client.emit('robotCreated', { success: true });
  }

  @SubscribeMessage('updatePosition')
  async handleUpdatePosition(
    @MessageBody() data: RobotPositionDto | RobotPositionDto[],
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Updating robot position', data);
    await this.robotService.addPositions(data);
    const latest = await this.robotService.getLatestPosition();
    this.server.emit('positionUpdated', latest);
  }

  @SubscribeMessage('getLatestPosition')
  async handleGetLatestPosition(@ConnectedSocket() client: Socket) {
    const position = await this.robotService.getLatestPosition();
    console.log('getting latest position', position);
    client.emit('latestPosition', position);
  }
}
