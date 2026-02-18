#!/bin/bash

# ========================================
# COMPLETE PRODUCTION DEPLOYMENT SCRIPT
# ========================================
# This deploys ALL recent changes:
# - Supabase to MySQL refactoring (38 files)
# - Cynessa agent knowledge tool
# - Chatbot portal fix
# - Database migrations
# ========================================

set -e  # Exit on any error

echo "🚀 DEPLOYING ALL CHANGES TO PRODUCTION"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration (UPDATE THESE!)
PRODUCTION_SERVER="your-production-server"
PRODUCTION_PATH="/var/www/cynergists-ai"
PRODUCTION_USER="your-user"

echo -e "${YELLOW}⚠️  WARNING: This will deploy to production!${NC}"
echo ""
echo "Server: $PRODUCTION_SERVER"
echo "Path: $PRODUCTION_PATH"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "=========================================="
echo "STEP 1: Push Code to Git"
echo "=========================================="

git status
echo ""
read -p "Push to origin main? (yes/no): " push_confirm

if [ "$push_confirm" = "yes" ]; then
    git push origin main
    echo -e "${GREEN}✅ Code pushed to Git${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping git push${NC}"
fi

echo ""
echo "=========================================="
echo "STEP 2: Deploy to Production Server"
echo "=========================================="

ssh $PRODUCTION_USER@$PRODUCTION_SERVER << 'ENDSSH'
set -e

echo ""
echo "📍 Current directory: $(pwd)"
echo ""

# Navigate to app directory
cd /var/www/cynergists-ai || exit 1

echo "✓ Changed to: $(pwd)"
echo ""

# Check git status
echo "Current branch:"
git branch --show-current
echo ""

# Pull latest code
echo "=========================================="
echo "Pulling latest code..."
echo "=========================================="
git pull origin main
echo "✅ Code pulled"
echo ""

# Install/update dependencies
echo "=========================================="
echo "Installing dependencies..."
echo "=========================================="
composer install --no-dev --optimize-autoloader
echo "✅ Composer dependencies installed"
echo ""

npm ci --production
echo "✅ NPM dependencies installed"
echo ""

# Run database migrations
echo "=========================================="
echo "Running migrations..."
echo "=========================================="
php artisan migrate --force
echo "✅ Migrations complete"
echo ""

# Grant Cynessa access
echo "=========================================="
echo "Granting Cynessa access..."
echo "=========================================="
php artisan cynessa:grant-access
echo "✅ Cynessa access granted"
echo ""

# Build frontend
echo "=========================================="
echo "Building frontend..."
echo "=========================================="
npm run build
echo "✅ Frontend built"
echo ""

# Clear all caches
echo "=========================================="
echo "Clearing caches..."
echo "=========================================="
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "✅ Caches cleared and rebuilt"
echo ""

# Restart queue workers
echo "=========================================="
echo "Restarting services..."
echo "=========================================="
php artisan queue:restart
echo "✅ Queue workers restarted"
echo ""

# Run health checks
echo "=========================================="
echo "Running health checks..."
echo "=========================================="

# Check Cynessa setup
php artisan tinker --execute="
echo '1. Cynessa agent: ';
echo App\Models\PortalAvailableAgent::where('name', 'Cynessa')->exists() ? '✅ EXISTS' : '❌ MISSING';
echo PHP_EOL;

echo '2. Cynessa access: ';
echo App\Models\AgentAccess::where('agent_name', 'Cynessa')->count() . ' users';
echo PHP_EOL;

echo '3. GetAgentInformationTool: ';
echo file_exists('app/Ai/Tools/GetAgentInformationTool.php') ? '✅ EXISTS' : '❌ MISSING';
echo PHP_EOL;

echo '4. Chatbot fix: ';
\$chatbot = file_get_contents('resources/js/cynergists/components/Chatbot.tsx');
echo strpos(\$chatbot, 'isPortalPage') !== false ? '✅ DEPLOYED' : '❌ MISSING';
echo PHP_EOL;
"

echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Visit https://cynergists.ai"
echo "2. Hard refresh browser (Cmd+Shift+R)"
echo "3. Test Cynessa chat"
echo "4. Ask: 'Tell me about Luna'"
echo "5. Verify no console errors"
echo ""

ENDSSH

echo ""
echo "=========================================="
echo "STEP 3: Verify Deployment"
echo "=========================================="
echo ""
echo "✅ Deployment script completed!"
echo ""
echo -e "${GREEN}🎉 ALL CHANGES DEPLOYED!${NC}"
echo ""
echo "Changes deployed:"
echo "  ✓ 38 files refactored (Supabase → MySQL)"
echo "  ✓ Cynessa agent knowledge tool"
echo "  ✓ Chatbot portal page fix"
echo "  ✓ Database migrations"
echo "  ✓ Frontend rebuilt"
echo "  ✓ Caches cleared"
echo ""
echo "Test checklist:"
echo "  [ ] Visit https://cynergists.ai/portal"
echo "  [ ] Open Cynessa chat"
echo "  [ ] Ask: 'Tell me about Luna'"
echo "  [ ] Verify full Luna details appear"
echo "  [ ] Check browser console for errors"
echo "  [ ] Test partner portal pages"
echo ""
echo "If issues occur, check:"
echo "  - Production logs: tail -f storage/logs/laravel.log"
echo "  - Browser console (F12)"
echo "  - Network tab for failed requests"
echo ""
