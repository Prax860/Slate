# Whiteboard App - Setup & Deployment Helper Script (Windows)

Write-Host "🎨 Whiteboard App - Setup & Deployment" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Blue

try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

try {
    $gitVersion = git --version
    Write-Host "✅ Git installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found. Please install Git" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Menu
Write-Host "What would you like to do?" -ForegroundColor Blue
Write-Host "1) Setup for local development"
Write-Host "2) Prepare for Vercel + Railway deployment"
Write-Host "3) Deploy to production"
Write-Host "4) View deployment guide"
Write-Host ""

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Setting up for local development..." -ForegroundColor Blue
        
        # Frontend
        Write-Host "Installing frontend dependencies..."
        npm install
        
        # Backend
        Write-Host "Installing backend dependencies..."
        Set-Location backend
        npm install
        Set-Location ..
        
        # Create env files
        if (-Not (Test-Path ".env.local")) {
            Write-Host "Creating .env.local..."
            @"
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
"@ | Out-File -Encoding utf8 .env.local
        }
        
        if (-Not (Test-Path "backend\.env")) {
            Write-Host "Creating backend\.env..."
            Copy-Item backend\.env.example backend\.env
        }
        
        Write-Host ""
        Write-Host "✅ Setup complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Start Redis: redis-server"
        Write-Host "2. In one terminal: npm run dev (frontend)"
        Write-Host "3. In another terminal: cd backend && npm run dev (backend)"
        Write-Host ""
        Write-Host "Open http://localhost:3000 in your browser"
    }
    
    "2" {
        Write-Host ""
        Write-Host "Preparing for Vercel + Railway deployment..." -ForegroundColor Blue
        
        # Check if git repo
        if (-Not (Test-Path ".git")) {
            Write-Host "Initializing git repository..."
            git init
            git add .
            git commit -m "Initial commit: Whiteboard app"
            Write-Host ""
            Write-Host "Next: Create a GitHub repo and push:" -ForegroundColor Yellow
            Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/whiteboard.git"
            Write-Host "  git push -u origin main"
        }
        
        Write-Host ""
        Write-Host "✅ Ready for deployment!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Push to GitHub: git push -u origin main"
        Write-Host "2. Create Vercel account at https://vercel.com"
        Write-Host "3. Create Railway account at https://railway.app"
        Write-Host "4. Follow DEPLOYMENT_GUIDE.md for step-by-step instructions"
    }
    
    "3" {
        Write-Host ""
        Write-Host "Deploying to production..." -ForegroundColor Blue
        Write-Host ""
        Write-Host "Prerequisites:" -ForegroundColor Yellow
        Write-Host "✓ GitHub repo created"
        Write-Host "✓ Vercel account setup"
        Write-Host "✓ Railway account setup"
        Write-Host "✓ Environment variables configured"
        Write-Host ""
        Write-Host "Pushing latest changes..."
        git add .
        git commit -m "Production deployment $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git push origin main
        
        Write-Host ""
        Write-Host "✅ Changes pushed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "GitHub Actions will now:" -ForegroundColor Cyan
        Write-Host "1. Run tests"
        Write-Host "2. Deploy backend to Railway"
        Write-Host "3. Deploy frontend to Vercel"
        Write-Host ""
        Write-Host "Check deployment status:" -ForegroundColor Cyan
        Write-Host "- GitHub: Actions tab"
        Write-Host "- Railway: Dashboard → Logs"
        Write-Host "- Vercel: Dashboard → Deployments"
    }
    
    "4" {
        Write-Host ""
        Write-Host "Opening DEPLOYMENT_GUIDE.md..." -ForegroundColor Blue
        
        if (Test-Path "DEPLOYMENT_GUIDE.md") {
            Get-Content "DEPLOYMENT_GUIDE.md" | Out-Host
        } else {
            Write-Host "DEPLOYMENT_GUIDE.md not found" -ForegroundColor Red
        }
    }
    
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "For more information, see:" -ForegroundColor Blue
Write-Host "- Local Development: README.md"
Write-Host "- Deployment: DEPLOYMENT_GUIDE.md"
Write-Host "- Architecture: DEPLOYMENT_STRATEGY.md"
Write-Host ""
