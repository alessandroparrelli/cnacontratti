#!/bin/bash

# 🚀 CNA Contratti - GitHub Deployment Script
# This script automates the push to GitHub repository

set -e  # Exit on error

echo "🚀 === CNA CONTRATTI GITHUB DEPLOYMENT ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "index.html" ] || [ ! -f "styles.css" ]; then
    echo -e "${RED}❌ Error: index.html or styles.css not found!${NC}"
    echo "Please run this script from the project directory"
    exit 1
fi

# Get GitHub username and token
echo -e "${BLUE}📝 GitHub Configuration${NC}"
echo ""

read -p "Enter your GitHub username: " GITHUB_USER
if [ -z "$GITHUB_USER" ]; then
    echo -e "${RED}❌ GitHub username is required${NC}"
    exit 1
fi

read -p "Choose auth method (1=Token/HTTPS, 2=SSH) [1]: " AUTH_METHOD
AUTH_METHOD=${AUTH_METHOD:-1}

if [ "$AUTH_METHOD" = "1" ]; then
    read -sp "Enter your GitHub Personal Access Token: " GITHUB_TOKEN
    echo ""
    if [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${RED}❌ GitHub token is required${NC}"
        exit 1
    fi
    REPO_URL="https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/cnacontratti.git"
else
    REPO_URL="git@github.com:${GITHUB_USER}/cnacontratti.git"
fi

echo ""
echo -e "${BLUE}🔍 Verifying Git Status${NC}"
echo ""

# Check git status
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Git repository not initialized${NC}"
    echo "This directory appears to not be a git repository"
    exit 1
fi

# Show git log
echo "Current commits:"
git log --oneline | head -5

echo ""
echo -e "${BLUE}🔗 Setting Up Remote Repository${NC}"
echo ""

# Remove existing origin if it exists
if git remote get-url origin > /dev/null 2>&1; then
    echo -e "${YELLOW}ℹ️  Remote origin already exists, updating...${NC}"
    git remote remove origin
fi

# Add new origin
echo "Adding remote: $REPO_URL"
git remote add origin "$REPO_URL"

# Show what will be pushed
echo ""
echo -e "${BLUE}📊 Changes to Push${NC}"
echo ""
echo "Branch: main"
echo "Files:"
git ls-files | sed 's/^/  ✓ /'

echo ""
echo -e "${BLUE}📈 File Statistics${NC}"
echo ""
wc -l index.html styles.css README.md DEPLOYMENT.md 2>/dev/null | tail -1 | awk '{print "  Total lines: " $1}'
du -sh . | awk '{print "  Directory size: " $1}'

echo ""
echo -e "${YELLOW}⚠️  ABOUT TO PUSH TO GITHUB${NC}"
echo ""
read -p "Are you sure you want to push to GitHub? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Pushing to GitHub${NC}"
echo ""

# Switch to main branch
echo "Switching to main branch..."
git branch -M main

# Push to GitHub
echo "Pushing to GitHub..."
if git push -u origin main --force; then
    echo ""
    echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
    echo ""
    echo "Repository Information:"
    echo "  📍 GitHub URL: https://github.com/${GITHUB_USER}/cnacontratti"
    echo "  🌐 Production: https://cnacontratti.vercel.app"
    echo "  📦 Branch: main"
    echo ""
    echo "Next steps:"
    echo "  1. Visit your repository: https://github.com/${GITHUB_USER}/cnacontratti"
    echo "  2. Check if Vercel auto-deploys (if configured)"
    echo "  3. Visit https://cnacontratti.vercel.app to verify deployment"
    echo ""
    echo -e "${GREEN}🎉 All done!${NC}"
else
    echo ""
    echo -e "${RED}❌ DEPLOYMENT FAILED${NC}"
    echo "Error pushing to GitHub. Please check:"
    echo "  - Your token is valid"
    echo "  - Your username is correct"
    echo "  - You have push permissions"
    exit 1
fi

