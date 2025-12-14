# Canvas Collab - Live Whiteboard with Clerk Authentication

A beautiful, modern collaborative whiteboard app built with Next.js 15, Socket.io, Redis, and Clerk authentication.

## 🎨 Features

✨ **Real-time Collaboration** - Draw together instantly with WebSocket synchronization
🎭 **Clerk OAuth** - Professional authentication with email, Google, GitHub
💾 **User Caching** - Redis-backed frequency tracking for returning users
🎨 **Beautiful UI** - Figma-inspired landing page with smooth animations
🔄 **Multi-board Support** - Create and manage unlimited whiteboards
🎯 **Drawing Tools** - Colors, brush sizes, grid, undo, clear
👥 **Live Presence** - See who's drawing in real-time with user cursors

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Copy your **Publishable Key** and **Secret Key**

### 3. Configure Environment

Create `.env.local` in the project root:

```env
# Clerk Authentication Keys (from https://dashboard.clerk.com/api-keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Redis (Optional - defaults to localhost:6379)
# REDIS_URL=redis://localhost:6379
```

### 4. Start Redis (if using local)

```bash
# Install Redis on Windows: https://github.com/microsoftarchive/redis/releases
redis-server
```

### 5. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you'll see the Figma-like landing page.

## 📋 User Flow

1. **Landing Page** (`/`) - Beautiful introduction with SignUp/SignIn buttons
2. **Sign In/Up** (`/sign-in`, `/sign-up`) - Clerk authentication with dark theme
3. **Dashboard** (`/dashboard`) - Create, manage, and join whiteboards
4. **Whiteboard** (`/whiteboard/[id]`) - Real-time collaborative drawing canvas

## 🏗️ Architecture

### Frontend Components
- **LandingPage** - Hero section, features, CTA, floating animations
- **Dashboard** - Board management, create/delete operations
- **WhiteboardCanvas** - Drawing canvas with Socket.io real-time sync
- **ClerkProvider** - Theming and authentication wrapper

### Backend
- **Socket.io Server** - Real-time drawing events, user presence per board
- **Redis Integration** - User caching with frequency tracking
- **Clerk Middleware** - Route protection for authenticated areas

### Technologies
- **Next.js 15** - App Router, API routes, middleware
- **React 19** - Hooks, functional components
- **TypeScript** - Full type safety
- **Tailwind CSS 3** - Dark theme with gradients
- **Framer Motion** - Smooth animations
- **Socket.io** - WebSocket real-time communication
- **Redis** - Caching and pub/sub
- **Clerk** - OAuth authentication

## 🎯 Key Features Explained

### Real-time Drawing Synchronization
- Each whiteboard is a Socket.io room (`board:${boardId}`)
- Drawing events broadcast to all connected clients in the room
- Canvas syncs with users joining mid-session

### User Frequency Tracking
- Users cached in Redis with 30-day TTL
- Sorted set tracks most frequent users by timestamp
- Enables personalization and performance optimization

### Professional Landing Page
- Figma-inspired design with hero section
- 6 feature cards with hover animations
- Stats section showing real-time capabilities
- 4-step onboarding process
- Beautiful CTA buttons with Clerk integration
- Floating shapes and smooth transitions

### Clerk Integration
- OAuth with multiple providers (email, Google, GitHub)
- Dark theme matching app colors
- Automatic redirect to dashboard on sign-in
- User data stored in Clerk (not local storage)
- Frequent users cached in Redis

## 📱 Routes

| Route | Auth Required | Purpose |
|-------|---------------|---------|
| `/` | No | Landing page with intro |
| `/sign-in` | No | Clerk authentication |
| `/sign-up` | No | Clerk registration |
| `/dashboard` | Yes | Board management |
| `/whiteboard/[id]` | Yes | Drawing canvas |
| `/api/socketio` | Yes | Socket.io endpoint |

## 🛠️ Development

### File Structure
```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout with ClerkProvider
│   ├── sign-in/[[...index]]/    # Clerk sign-in page
│   ├── sign-up/[[...index]]/    # Clerk sign-up page
│   ├── dashboard/               # Board management
│   └── whiteboard/[id]/         # Canvas
├── components/
│   ├── LandingPage.tsx          # Figma-inspired UI
│   ├── Dashboard.tsx            # Board CRUD
│   ├── WhiteboardCanvas.tsx     # Drawing canvas
│   └── ClerkProvider.tsx        # Clerk wrapper
├── lib/
│   ├── redis.ts                 # Redis client
│   └── userCache.ts             # User caching service
└── pages/
    └── api/
        └── socketio.ts          # Socket.io server
```

### Available Scripts
```bash
npm run dev    # Start dev server with Turbopack
npm run build  # Build for production
npm start      # Run production server
npm run lint   # Run ESLint
```

## 🔑 Environment Variables

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | `pk_test_...` | Clerk frontend key |
| `CLERK_SECRET_KEY` | Yes | `sk_test_...` | Clerk backend key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Yes | `/sign-in` | Sign in route |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Yes | `/sign-up` | Sign up route |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Yes | `/dashboard` | Post-login redirect |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Yes | `/dashboard` | Post-signup redirect |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection |

## 🎨 Customization

### Change Colors
- Update Tailwind theme in `tailwind.config.ts`
- Primary: Purple/Pink gradients
- Secondary: Cyan, Blue, Red for tools

### Update Landing Page
- Edit `LandingPage.tsx` for features, stats, CTA
- Modify `ClerkProvider.tsx` for auth theme
- Adjust animations in `framer-motion` sections

### Drawing Canvas Options
- Brush colors in `WhiteboardCanvas.tsx` `colors` array
- Grid toggle and undo/clear buttons
- Real-time cursor tracking per user

## 🐛 Troubleshooting

### "Clerk Publishable Key is invalid"
- Get key from [Clerk Dashboard](https://dashboard.clerk.com/api-keys)
- Must start with `pk_` (public) or `pk_test_`
- Add to `.env.local` as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

### "Cannot connect to Redis"
- Ensure Redis is running: `redis-server`
- Default: `localhost:6379`
- Set `REDIS_URL` for remote Redis

### Socket.io connection fails
- Check network tab in DevTools
- Ensure `/api/socketio` endpoint is accessible
- Verify auth middleware allows Socket.io requests

### "User not authenticated"
- Middleware protects `/dashboard` and `/whiteboard` routes
- Must sign in via Clerk first
- Check `.env.local` has valid Clerk keys

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Socket.io Documentation](https://socket.io/docs/)
- [Redis Documentation](https://redis.io/docs/)
- [Framer Motion](https://www.framer.com/motion/)

## 📝 License

MIT License - feel free to use for personal or commercial projects.

## 🎉 What's Included

- ✅ Multi-user real-time drawing
- ✅ Clerk OAuth authentication
- ✅ User frequency caching with Redis
- ✅ Beautiful Figma-inspired landing page
- ✅ Dark mode with purple/pink theme
- ✅ Responsive design
- ✅ TypeScript for type safety
- ✅ Middleware for route protection
- ✅ Socket.io for WebSocket sync
- ✅ Animation-heavy UI with Framer Motion

Enjoy creating beautiful whiteboards together! 🎨✨
