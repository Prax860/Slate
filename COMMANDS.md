# 💻 Canvas Collab - Command Reference

## 🚀 Quick Start Commands

### 1. Start Redis
```bash
# Create and run Redis container
docker run -d -p 6379:6379 --name redis-whiteboard redis:latest

# Verify it's running
docker ps | grep redis

# View Redis logs
docker logs redis-whiteboard

# Connect to Redis CLI (optional)
docker exec -it redis-whiteboard redis-cli
```

### 2. Start Development Server
```bash
# Navigate to project
cd d:\redis

# Install dependencies (if needed)
npm install

# Start dev server
npm run dev

# App will be available at http://localhost:3000
```

### 3. Build for Production
```bash
# Create optimized build
npm run build

# Test production build locally
npm start

# App will be at http://localhost:3000
```

## 📊 Development Commands

### Running Tests
```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint -- --fix
```

### Code Quality
```bash
# Format with Prettier (if configured)
npm run format

# Type check with TypeScript
npx tsc --noEmit
```

### Dependency Management
```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Install specific package
npm install package-name

# Uninstall package
npm uninstall package-name
```

## 🐳 Docker Commands

### Redis Management
```bash
# Start Redis
docker run -d -p 6379:6379 --name redis-whiteboard redis:latest

# Stop Redis
docker stop redis-whiteboard

# Start stopped container
docker start redis-whiteboard

# Restart Redis
docker restart redis-whiteboard

# Remove Redis container
docker rm redis-whiteboard

# Remove all stopped containers
docker container prune

# View all containers
docker ps -a

# View Redis memory usage
docker stats redis-whiteboard
```

### Redis CLI Commands (inside container)
```bash
# Connect to Redis
docker exec -it redis-whiteboard redis-cli

# Then in Redis CLI:
ping                      # Test connection
info                      # Server information
keys *                    # View all keys
keys user:*               # View user keys
keys board:*              # View board keys
get user:board:123:user:456  # Get specific key
del user:board:123:user:456  # Delete key
flushdb                   # Clear all data
flushall                  # Clear all databases
exit                      # Exit CLI
```

## 🔧 Development Server Management

### Start/Stop
```bash
# Start dev server (default port 3000)
npm run dev

# Stop dev server (Ctrl+C in terminal)

# Start on specific port
PORT=3001 npm run dev

# Build and run production
npm run build
npm start
```

### Debugging
```bash
# View console output
# Check browser DevTools (F12)

# View server logs
# Watch terminal running 'npm run dev'

# Enable verbose logging (in code)
# Add console.log() statements
```

## 📁 Project Navigation

### View Project Files
```bash
# List all files
ls -la

# List only source files
ls -la src/

# List components
ls -la src/components/

# List pages
ls -la src/app/

# List API routes
ls -la src/pages/api/
```

### Edit Files
```bash
# Use VS Code (easiest)
code .

# Or your preferred editor
vim src/components/LoginScreen.tsx
```

## 🔐 Credential Management

### Set Environment Variables
Create `.env.local` file:
```bash
# For local development (add if needed)
REDIS_URL=localhost:6379
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Access Credentials
```bash
# View environment variables
echo $REDIS_URL

# Set temporary env var
export REDIS_URL=localhost:6379

# Use in command
REDIS_URL=localhost:6379 npm run dev
```

## 📦 NPM Package Commands

### Common Tasks
```bash
# Install all dependencies
npm install

# Install specific package
npm install socket.io redis framer-motion

# Install as dev dependency
npm install --save-dev typescript

# Update all packages
npm update

# Check installed packages
npm list

# View package info
npm view socket.io

# Remove package
npm uninstall socket.io

# Clear npm cache
npm cache clean --force
```

### Production vs Development
```bash
# Install only production dependencies
npm install --production

# Install and save as dev dependency
npm install --save-dev eslint

# Show what would be installed
npm install --dry-run
```

## 🌐 Testing Multi-User Locally

### Multiple Browser Tabs
```bash
# Terminal 1: Run dev server
npm run dev

# Browser Tab 1: http://localhost:3000
# - Login as "Artist 1"
# - Create "Board 1"

# Browser Tab 2: http://localhost:3000 (Incognito)
# - Login as "Artist 2"
# - Enter same "Board 1"

# Draw in Tab 1 → See in Tab 2 instantly!
```

### Using Different Devices
```bash
# Get your machine IP
ipconfig (Windows)
ifconfig (Mac/Linux)

# Share URL with others
http://YOUR_IP:3000

# They can:
# - Login with different username
# - Create or join boards
# - See your drawings in real-time!
```

## 📊 Database/Redis CLI

### Connect to Redis
```bash
# Via Docker
docker exec -it redis-whiteboard redis-cli

# Via local Redis (if installed)
redis-cli

# Via remote Redis
redis-cli -h REDIS_HOST -p 6379
```

### Redis Commands for Debugging
```bash
# Connection
ping                           # Returns PONG

# Key Management
keys *                         # Show all keys
keys user:*                    # Show user keys
exists key_name                # Check if exists
del key_name                   # Delete key
ttl key_name                   # Show expiration

# Data
get key_name                   # Get string value
hgetall key_name               # Get hash all
lpush list_name value          # Add to list
smembers set_name              # Show set members

# Server
info                           # Server info
dbsize                         # Number of keys
flushdb                        # Clear current DB
flushall                       # Clear all DBs
save                           # Force save
shutdown                       # Stop Redis
```

## 🛠️ Troubleshooting Commands

### Check if Services Running
```bash
# Check if Node.js is running
npm list --global node

# Check if Redis is running
docker ps | grep redis

# Check port availability
netstat -ano | findstr 3000 (Windows)
lsof -i :3000 (Mac/Linux)

# Check port 6379 (Redis)
netstat -ano | findstr 6379 (Windows)
lsof -i :6379 (Mac/Linux)
```

### Restart Everything
```bash
# 1. Stop dev server (Ctrl+C in terminal)

# 2. Restart Redis
docker restart redis-whiteboard

# 3. Clear npm cache (optional)
npm cache clean --force

# 4. Reinstall dependencies (if needed)
rm -rf node_modules package-lock.json
npm install

# 5. Start dev server again
npm run dev
```

### Fix Common Issues
```bash
# Port 3000 already in use?
# Kill process on port 3000
netstat -ano | findstr 3000 (Windows)
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev

# Can't connect to Redis?
# Check if Redis is running
docker ps

# If not running, start it
docker run -d -p 6379:6379 --name redis-whiteboard redis:latest

# Clear browser storage
# Open DevTools (F12) → Application → localStorage → Clear All
```

## 📈 Performance Monitoring

### Check Memory Usage
```bash
# Node.js memory
node --max-old-space-size=4096 (increase if needed)

# Docker container
docker stats redis-whiteboard

# System memory
free -h (Linux/Mac)
systeminfo | findstr Memory (Windows)
```

### Monitor Requests
```bash
# View real-time logs
# Check terminal running 'npm run dev'

# Check Socket.io connections
# Look for "New client connected" messages

# View Redis operations
docker exec -it redis-whiteboard redis-cli MONITOR
```

## 🚀 Deployment Commands

### Build for Deployment
```bash
# Create optimized build
npm run build

# Check build size
npm run build -- --analyze

# Test production build
npm start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t canvas-collab .

# Run container
docker run -p 3000:3000 canvas-collab

# Run with environment variables
docker run -p 3000:3000 \
  -e REDIS_URL=redis://redis:6379 \
  canvas-collab

# Push to registry
docker tag canvas-collab username/canvas-collab
docker push username/canvas-collab
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod

# Check status
vercel list

# View logs
vercel logs
```

## 📝 Git Commands (if using version control)

```bash
# Initialize git repo
git init

# Add files
git add .

# Commit changes
git commit -m "Add canvas collab feature"

# Push to remote
git push origin main

# View history
git log

# Check status
git status
```

## 💡 Useful One-Liners

```bash
# Kill all Node processes
pkill -f "node"

# Install dependencies and start
npm install && npm run dev

# Build and test locally
npm run build && npm start

# Clear cache and reinstall
rm -rf node_modules && npm install

# Run build in background
nohup npm run dev > app.log 2>&1 &

# View live logs
tail -f app.log

# Count lines of code
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l

# Format code (if prettier installed)
npx prettier --write src/
```

## 🔍 Monitoring Commands

### Real-time Monitoring
```bash
# Watch file changes
watch -n 1 'docker ps | grep redis'

# Monitor in real-time
docker stats redis-whiteboard --no-stream=false

# Check Node processes
ps aux | grep node

# View network connections
netstat -an | grep 3000
```

### Logs
```bash
# Docker logs
docker logs redis-whiteboard

# Follow logs
docker logs -f redis-whiteboard

# Last 100 lines
docker logs --tail 100 redis-whiteboard

# With timestamps
docker logs -t redis-whiteboard

# Server console
# Check terminal running 'npm run dev'
```

## 🎯 Complete Flow Commands

### Full Setup (Fresh Start)
```bash
# 1. Start Redis
docker run -d -p 6379:6379 --name redis-whiteboard redis:latest

# 2. Navigate to project
cd d:\redis

# 3. Install dependencies
npm install

# 4. Start dev server
npm run dev

# 5. Open browser
start http://localhost:3000

# Done! 🎉
```

### Testing Multi-User
```bash
# Terminal 1: Dev server
npm run dev

# Browser 1: http://localhost:3000
# Login & Create Board

# Browser 2: http://localhost:3000 (Incognito)
# Login & Join Same Board

# Both browsers: Draw together!
```

### Clean Everything & Start Fresh
```bash
# Stop everything
docker stop redis-whiteboard
# (Ctrl+C in dev server terminal)

# Remove Redis container
docker rm redis-whiteboard

# Clean Node
rm -rf node_modules package-lock.json

# Reinstall and start
npm install
npm run dev

# Start Redis
docker run -d -p 6379:6379 --name redis-whiteboard redis:latest

# Good as new! ✅
```

---

**Save this file for quick reference while developing! 💾**
