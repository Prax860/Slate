# 🎨 Whiteboard Backend Server

Real-time collaborative whiteboard backend with Socket.io and Express.js

## Features

- ✅ Real-time drawing with Socket.io
- ✅ Share code generation & validation
- ✅ Multi-user collaboration
- ✅ Redis data persistence
- ✅ Production-ready architecture
- ✅ Docker containerization

## Quick Start

### Prerequisites
- Node.js 18+
- Redis running locally or remotely

### Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

Server runs on `http://localhost:3001`

### Production

```bash
# Build TypeScript
npm run build

# Start server
npm start
```

## API Endpoints

### Health Check
```
GET /health
Response: { "status": "ok", "timestamp": "..." }
```

### Generate Share Code
```
POST /api/share
Body: {
  "boardId": "board-123",
  "boardName": "My Board",
  "userId": "user-456"
}
Response: {
  "shareCode": "A3K9M2",
  "expiresAt": 1704067200000
}
```

### Validate Share Code
```
GET /api/share?code=A3K9M2
Response: {
  "boardId": "board-123",
  "boardName": "My Board",
  "createdBy": "user-456",
  "createdAt": 1704067000000
}
```

## Socket.io Events

### Client → Server

#### `user:join`
User joins a whiteboard
```typescript
socket.emit('user:join', {
  username: string,
  userId: string,
  boardId: string
})
```

#### `draw`
Send drawing data
```typescript
socket.emit('draw', {
  x: number,
  y: number,
  color: string,
  size: number,
  boardId: string
})
```

#### `canvas:clear`
Clear the canvas
```typescript
socket.emit('canvas:clear', { boardId: string })
```

#### `canvas:undo`
Undo last action
```typescript
socket.emit('canvas:undo', { boardId: string })
```

#### `color:change`
Change drawing color
```typescript
socket.emit('color:change', {
  color: string,
  boardId: string
})
```

### Server → Client

#### `user:joined`
Another user joined
```typescript
socket.on('user:joined', (data: {
  userId: string,
  username: string,
  userCount: number
}))
```

#### `user:left`
User left the board
```typescript
socket.on('user:left', (data: {
  userId: string,
  userCount: number
}))
```

#### `draw`
Receive drawing data
```typescript
socket.on('draw', (data: DrawingPoint))
```

#### `canvas:clear`
Canvas was cleared
```typescript
socket.on('canvas:clear', ())
```

#### `canvas:undo`
Undo was performed
```typescript
socket.on('canvas:undo', ())
```

#### `color:change`
User changed color
```typescript
socket.on('color:change', (data: {
  color: string,
  userId: string
}))
```

#### `userCount`
Updated user count
```typescript
socket.on('userCount', (count: number))
```

## Configuration

### Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## Deployment

### Docker

```bash
# Build image
docker build -t whiteboard-backend .

# Run container
docker run -p 3001:3001 \
  -e REDIS_HOST=your-redis-host \
  -e FRONTEND_URL=https://your-frontend.com \
  whiteboard-backend
```

### Railway

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for step-by-step instructions.

## Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm start        # Start production server
npm run lint     # Run ESLint
npm run test     # Run tests
```

## File Structure

```
backend/
├── src/
│   ├── server.ts          # Express + Socket.io server
│   ├── api/               # API endpoints
│   ├── socket/            # Socket.io handlers
│   └── lib/               # Utilities
├── dist/                  # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── Dockerfile
```

## Performance

- ✅ Optimized for real-time collaboration
- ✅ Efficient Redis caching
- ✅ Socket.io room isolation
- ✅ Graceful connection handling

## Security

- ✅ CORS configuration
- ✅ Input validation
- ✅ Redis authentication support
- ✅ Graceful error handling

## Monitoring

### Health Check
```bash
curl http://localhost:3001/health
```

### Logs
- Console logs for development
- Integration with Railway logs for production
- Event-based logging for debugging

## Troubleshooting

### Redis Connection Error
- Verify Redis is running
- Check `REDIS_HOST` and `REDIS_PORT`
- Check firewall settings

### Port Already in Use
```bash
# Change PORT in .env or:
PORT=3002 npm run dev
```

### Socket.io Connection Issues
- Verify `FRONTEND_URL` is correct
- Check CORS settings
- Ensure frontend is connecting to correct WS URL

## Contributing

1. Create a feature branch
2. Make changes
3. Test locally
4. Create a pull request
5. GitHub Actions will test and deploy

## License

ISC

## Support

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for deployment help.
