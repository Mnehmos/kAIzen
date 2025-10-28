#!/bin/bash

# kAIzen Systems - GitHub Deployment Script
# Run this after creating your GitHub repository

echo "🚀 kAIzen Systems GitHub Deployment"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository. Run 'git init' first."
    exit 1
fi

echo "✅ Git repository found"
echo ""

# Prompt for GitHub username
read -p "Enter your GitHub username: " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
    echo "❌ GitHub username is required"
    exit 1
fi

echo ""
echo "📝 Repository will be created at:"
echo "   https://github.com/$GITHUB_USER/kaizen-systems"
echo ""
echo "⚠️  IMPORTANT: Create this repository on GitHub first!"
echo "   1. Go to: https://github.com/new"
echo "   2. Name: kaizen-systems"
echo "   3. Description: kAIzen Systems - Standardizing AI Workflows at Scale"
echo "   4. Public repository"
echo "   5. Do NOT initialize with README"
echo "   6. Click 'Create repository'"
echo ""

read -p "Have you created the repository on GitHub? (y/n): " CREATED

if [ "$CREATED" != "y" ] && [ "$CREATED" != "Y" ]; then
    echo "❌ Please create the repository first, then run this script again"
    exit 1
fi

echo ""
echo "🔗 Adding remote..."
git remote add origin "https://github.com/$GITHUB_USER/kaizen-systems.git"

echo "📦 Renaming branch to main..."
git branch -M main

echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your website will be live at:"
echo "   https://$GITHUB_USER.github.io/kaizen-systems/"
echo ""
echo "📝 Next steps:"
echo "   1. Go to: https://github.com/$GITHUB_USER/kaizen-systems/settings/pages"
echo "   2. Under 'Source', select: Branch 'main', folder '/ (root)'"
echo "   3. Click 'Save'"
echo "   4. Wait 1-2 minutes for GitHub to build"
echo "   5. Your site will be live!"
echo ""
echo "🎉 Happy launching!"