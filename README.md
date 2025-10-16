# Robot Game Application

A web-based robot game application that tracks robot position history on a 5x5 game board. The application consists of an Angular frontend, a NestJS backend API, and a SQLite database.

## Architecture

- **UI**: Angular 18+ application with standalone components
- **API**: NestJS application with WebSocket support
- **Database**: SQLite for position history tracking
- **Communication**: WebSocket connections for real-time updates

## Features

- Place a robot on a 5x5 grid
- Move the robot (forward, left, right)
- Track all position changes in a database
- Real-time position updates via WebSockets
- Offline support with automatic sync when back online
- Position history persisted across sessions

## Prerequisites

- Node.js 20 or higher
- npm
- Docker and Docker Compose (for containerized deployment)

## Getting Started

### Local Development

#### API Setup

```bash
cd api
npm install
npm run start:dev
```

The API will be available at `http://localhost:3000`.

#### UI Setup

```bash
cd ui
npm install
npm start
```

The UI will be available at `http://localhost:4200`.

### Docker Deployment

The easiest way to run the complete application is using Docker Compose:

```bash
# Build and start all services
docker-compose up

# Run in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

Once started:
- UI: http://localhost:4200
- API: http://localhost:3000

## Usage

1. **Place the Robot**: Click on any cell in the grid to place the robot facing north
2. **Move**: Click the "Move" button to move the robot one cell forward in its current direction
3. **Turn Left/Right**: Use the "Left" and "Right" buttons to rotate the robot 90 degrees
4. **Report**: Click the "Report" button to display the robot's current position

### Keyboard Controls

When a cell is focused:
- **Enter**: Place the robot
- **Arrow keys**: Move the robot directly (bypassing the current facing direction)

## Project Structure

```
toy-robot/
├── api/                    # NestJS backend
│   ├── src/
│   │   ├── robot/         # Robot module (entities, services, gateway)
│   │   └── app.module.ts  # Main application module
│   ├── Dockerfile
│   └── package.json
├── ui/                     # Angular frontend
│   ├── src/
│   │   └── app/
│   │       ├── robot/     # Robot feature module
│   │       │   ├── components/  # Board component
│   │       │   ├── services/    # Robot service
│   │       │   └── models/      # TypeScript interfaces
│   │       └── app.ts     # Root component
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Testing

### API Tests

```bash
cd api
npm test                # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
```

### UI Tests

```bash
cd ui
npm test               # Run all tests
```

#### Missing Tests

- The UI's `RobotService` is missing tests, partly due to a lack of time, and partly due to the need to mock out the socket client. Admittedly, integration tests or e2e tests would be far preferable and valuable than mocking out a socket client.

## Database

The application uses SQLite to store robot position history. The database file (`robot.db`) is created automatically on first run.

### Position Entry Schema

- `id`: Auto-incrementing primary key
- `robotId`: Static ID (always 1 for single robot)
- `x`: X coordinate (0-4)
- `y`: Y coordinate (0-4)
- `facing`: Direction ('north', 'south', 'east', 'west')
- `createdAt`: Timestamp

### Performance Notes

The application is optimized for a single robot and single user:
- Creating a new robot clears all position history using `DELETE` without a WHERE clause, which is the most efficient approach for SQLite when clearing entire tables
- Position updates can handle multiple positions in a single request for batch operations
- Auto-incrementing IDs are safe since there's no concurrent access

## Offline Support

The UI includes offline support:
- Position updates are queued in localStorage when offline
- Queued updates are automatically sent when connection is restored
- Creating a new robot clears the offline queue

## API Endpoints (WebSocket)

### Events

- **createRobot**: Clear position history and create a new robot
  - Emits: `robotCreated`

- **updatePosition**: Add position(s) to history
  - Payload: `RobotPosition | RobotPosition[]`
  - Emits: `positionUpdated` (broadcasts to all clients)

- **getLatestPosition**: Retrieve the most recent position
  - Emits: `latestPosition`

## License

UNLICENSED
