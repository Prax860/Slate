# 🎨 Canvas Collab

A stunning real-time collaborative whiteboard application with login, multiple boards, grid support, and funky cartoon decorations! Built with Next.js, powered by Redis pub/sub and Socket.io for live synchronization.

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 3-step setup & quick demo
- **[FEATURES.md](FEATURES.md)** - Visual feature showcase
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design & diagrams
- **[COMMANDS.md](COMMANDS.md)** - All command reference
- **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** - What you've built

## 🌟 Features

- **🔐 Login System**: Simple username-based authentication
- **📊 Dashboard**: Create, manage, and switch between multiple whiteboards
- **🎨 Real-time Collaboration**: See other users draw in real-time across different boards
- **👥 Live User Presence**: Watch who's currently drawing on each board
- **📐 Grid Overlay**: Toggle grid on/off for precise drawing alignment
- **🖌️ Multiple Drawing Tools**:
  - 8 beautiful gradient colors
  - Adjustable brush sizes (1-30px)
  - Undo & Clear canvas
- **🎭 Funky Decorations**: Animated cartoon mascots and floating emojis
- **🌙 Beautiful Dark UI**: Modern dark mode with smooth animations
- **⚡ Redis Integration**: Caching and pub/sub messaging
- **🚀 Socket.io**: WebSocket-based real-time communication per board

## 🎮 How It Works

1. **Login** → Enter your artist name
2. **Dashboard** → Create new whiteboards or enter existing ones
3. **Whiteboard** → Draw, collaborate with others, toggle grid, adjust colors & brush
4. **Real-time Sync** → All drawing updates are instantly shared via Socket.io
5. **Multiple Boards** → Keep different boards separate with user isolation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker (for Redis)

### Installation

1. **Start Redis using Docker**
```bash
docker run -d -p 6379:6379 --name redis-whiteboard redis:latest
```

2. **Install dependencies** (already done)
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open in your browser**
```
http://localhost:3000
```

### Test with Multiple Users

Open multiple browser tabs/windows:
1. Log in with different usernames
2. Create or enter the same whiteboard
3. See real-time drawing synchronization!

## 🎨 User Flow

```
Home (Login)
    ↓
Dashboard (Create/View Whiteboards)
    ↓
Whiteboard (Draw, Collaborate, Toggle Grid)
    ↓
← Back to Dashboard
```

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home/Login page
│   ├── dashboard/
│   │   └── page.tsx            # Dashboard page
│   └── whiteboard/
│       └── [id]/
│           └── page.tsx        # Whiteboard page (dynamic)
├── components/
│   ├── LoginScreen.tsx         # Login form with cartoon
│   ├── Dashboard.tsx           # Whiteboard management
│   ├── WhiteboardCanvas.tsx    # Main drawing canvas
│   └── LoadingScreen.tsx       # Initial loading animation
├── lib/
│   └── redis.ts                # Redis client config
└── pages/
    └── api/
        └── socketio.ts         # Socket.io server (multi-board)
```

## 🔧 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 3
- **Animations**: Framer Motion
- **Real-time**: Socket.io, Socket.io-client
- **Backend**: Next.js API routes
- **Database/Cache**: Redis
- **Utilities**: nanoid (unique IDs)

## 🎯 Key Features Explained

### 1. **Login System**
- No password required
- Username stored in localStorage
- Funky animated cartoon mascot

### 2. **Dashboard**
- Create new whiteboards
- View all created boards
- Delete boards
- Click to enter a board
- Live emoji floating animations

### 3. **Whiteboard Canvas**
- **Grid Toggle**: Press the 📐 Grid button to show/hide alignment grid
- **Colors**: 8 gradient colors for drawing
- **Brush Size**: Slider from 1-30px
- **Undo**: Undo individual strokes
- **Clear**: Clear entire canvas (syncs across users)
- **User List**: See who's currently drawing
- **Board Info**: Shows current board name and your username

### 4. **Real-time Sync**
- Drawing events broadcast via Socket.io rooms (per board)
- Users isolated by board ID
- Redis caches user presence
- Automatic user count updates

### 5. **Animations & Decorations**
- Rotating cartoon mascots
- Floating emojis (🎨, ✏️, 🖌️, etc.)
- Pulsing connection indicator
- Smooth transitions throughout

## 🐛 Troubleshooting

### Redis Connection Issues
```bash
# Check if Redis is running
docker ps | grep redis

# View Redis logs
docker logs redis-whiteboard

# Restart Redis
docker restart redis-whiteboard
```

### Socket.io Not Connecting
- Ensure app is running on `http://localhost:3000`
- Check browser console for connection errors
- Verify Socket.io path: `/api/socketio/`

### Drawing Not Syncing
1. Check browser console (F12) for errors
2. Verify Redis is running
3. Check if Socket.io connected (green dot indicator)
4. Try refreshing the page
5. Make sure both users are on the SAME board

### Grid Not Showing
- Click the "📐 Grid" button in toolbar
- Grid is toggleable per session

## 💾 Data Persistence

- **Whiteboards**: Stored in localStorage (browser)
- **User Presence**: Cached in Redis (1 hour expiration)
- **Drawing Data**: Published to Redis but not persisted (could be added)

## 🎨 Customization

### Add More Colors
Edit [src/components/WhiteboardCanvas.tsx](src/components/WhiteboardCanvas.tsx):
```tsx
const colors = [
  '#a78bfa',  // Purple
  '#f472b6',  // Pink
  '#38bdf8',  // Blue
  // Add your colors here
];
```

### Change Grid Size
In [src/components/WhiteboardCanvas.tsx](src/components/WhiteboardCanvas.tsx):
```tsx
const gridSize = 50; // Change to your preferred size
```

### Customize Cartoon
Edit [src/components/Dashboard.tsx](src/components/Dashboard.tsx) `CartoonDance` SVG component

## 🚀 Deployment

### For Vercel
1. Push to GitHub
2. Connect to Vercel
3. Set up Redis (use Upstash or similar)
4. Deploy!

### For Docker
```bash
docker build -t canvas-collab .
docker run -p 3000:3000 -e REDIS_URL=redis://redis:6379 canvas-collab
```

## 📝 Environment Setup

Currently uses default configuration:
- Redis: `localhost:6379`
- Socket.io path: `/api/socketio/`

To customize, edit:
- [src/lib/redis.ts](src/lib/redis.ts)
- [src/pages/api/socketio.ts](src/pages/api/socketio.ts)

## 🎪 Fun Features

- 🎭 Funky cartoon mascots dancing
- ✨ Floating animated emojis
- 🌊 Gradient backgrounds that pulse
- 📐 Grid overlay for pixel-perfect alignment
- 🎨 Real-time color changes
- 👥 Live artist list with pulsing indicators
- 💫 Smooth transition animations everywhere

## 📚 API Reference

### Socket.io Events

**Client → Server:**
- `user:join` - User enters a board
- `draw` - Drawing point sent
- `canvas:clear` - Clear the canvas
- `canvas:undo` - Undo last stroke
- `color:change` - Change brush color

**Server → Client:**
- `user:joined` - User joined the board
- `user:left` - User left the board
- `draw` - Drawing update
- `canvas:clear` - Canvas cleared
- `canvas:undo` - Undo executed
- `userCount` - Total users on board
- `color:change` - Color update from user

## 💡 Future Enhancements

- [ ] Drawing history/persistent storage
- [ ] Shape tools (circles, rectangles, lines)
- [ ] Text annotation
- [ ] Zoom and pan
- [ ] Cursor following (see where others are drawing)
- [ ] Chat in whiteboard
- [ ] Collaborative rooms
- [ ] Mobile/touch support
- [ ] Image upload
- [ ] Drawing export (PNG/SVG)

## 🙌 Contributing

Feel free to fork, create issues, and submit pull requests!

---

**Happy Drawing & Collaborating! 🎨✨**
