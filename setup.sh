#!/bin/bash

# Whiteboard App - Setup & Deployment Helper Script

set -e

echo "🎨 Whiteboard App - Setup & Deployment"
echo "======================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js $(node --version)"

if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install Git"
    exit 1
fi

echo "✅ Git installed"
echo ""

# Menu
echo -e "${BLUE}What would you like to do?${NC}"
echo "1) Setup for local development"
echo "2) Prepare for Vercel + Railway deployment"
echo "3) Deploy to production"
echo "4) View deployment guide"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}Setting up for local development...${NC}"
        
        # Frontend
        echo "Installing frontend dependencies..."
        npm install
        
        # Backend
        echo "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
        
        # Create env files
        if [ ! -f .env.local ]; then
            echo "Creating .env.local..."
            cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
EOF
        fi
        
        if [ ! -f backend/.env ]; then
            echo "Creating backend/.env..."
            cp backend/.env.example backend/.env
        fi
        
        echo ""
        echo -e "${GREEN}✅ Setup complete!${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Start Redis: redis-server"
        echo "2. In one terminal: npm run dev (frontend)"
        echo "3. In another terminal: cd backend && npm run dev (backend)"
        echo ""
        echo "Open http://localhost:3000 in your browser"
        ;;
        
    2)
        echo ""
        echo -e "${BLUE}Preparing for Vercel + Railway deployment...${NC}"
        
        # Check if git repo
        if [ ! -d .git ]; then
            echo "Initializing git repository..."
            git init
            git add .
            git commit -m "Initial commit: Whiteboard app"
            echo ""
            echo "Next: Create a GitHub repo and push:"
            echo "  git remote add origin https://github.com/YOUR_USERNAME/whiteboard.git"
            echo "  git push -u origin main"
        fi
        
        echo ""
        echo -e "${GREEN}✅ Ready for deployment!${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Push to GitHub: git push -u origin main"
        echo "2. Create Vercel account at https://vercel.com"
        echo "3. Create Railway account at https://railway.app"
        echo "4. Follow DEPLOYMENT_GUIDE.md for step-by-step instructions"
        ;;
        
    3)
        echo ""
        echo -e "${BLUE}Deploying to production...${NC}"
        echo ""
        echo "Prerequisites:"
        echo "✓ GitHub repo created"
        echo "✓ Vercel account setup"
        echo "✓ Railway account setup"
        echo "✓ Environment variables configured"
        echo ""
        echo "Pushing latest changes..."
        git add .
        git commit -m "Production deployment $(date)"
        git push origin main
        
        echo ""
        echo -e "${GREEN}✅ Changes pushed!${NC}"
        echo ""
        echo "GitHub Actions will now:"
        echo "1. Run tests"
        echo "2. Deploy backend to Railway"
        echo "3. Deploy frontend to Vercel"
        echo ""
        echo "Check deployment status:"
        echo "- GitHub: Actions tab"
        echo "- Railway: Dashboard → Logs"
        echo "- Vercel: Dashboard → Deployments"
        ;;
        
    4)
        echo ""
        if command -v open &> /dev/null; then
            open DEPLOYMENT_GUIDE.md
        elif command -v xdg-open &> /dev/null; then
            xdg-open DEPLOYMENT_GUIDE.md
        else
            cat DEPLOYMENT_GUIDE.md
        fi
        ;;
        
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}For more information, see:${NC}"
echo "- Local Development: README.md"
echo "- Deployment: DEPLOYMENT_GUIDE.md"
echo "- Architecture: DEPLOYMENT_STRATEGY.md"
echo ""
