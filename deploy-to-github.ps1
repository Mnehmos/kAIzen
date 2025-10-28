# kAIzen Systems - GitHub Deployment Script (PowerShell)
# Run this after creating your GitHub repository

Write-Host "🚀 kAIzen Systems GitHub Deployment" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "❌ Error: Not a git repository. Run 'git init' first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Git repository found" -ForegroundColor Green
Write-Host ""

# Prompt for GitHub username
$GITHUB_USER = Read-Host "Enter your GitHub username"

if ([string]::IsNullOrWhiteSpace($GITHUB_USER)) {
    Write-Host "❌ GitHub username is required" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📝 Repository will be created at:" -ForegroundColor Yellow
Write-Host "   https://github.com/$GITHUB_USER/kaizen-systems" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: Create this repository on GitHub first!" -ForegroundColor Yellow
Write-Host "   1. Go to: https://github.com/new" -ForegroundColor White
Write-Host "   2. Name: kaizen-systems" -ForegroundColor White
Write-Host "   3. Description: kAIzen Systems - Standardizing AI Workflows at Scale" -ForegroundColor White
Write-Host "   4. Public repository" -ForegroundColor White
Write-Host "   5. Do NOT initialize with README" -ForegroundColor White
Write-Host "   6. Click 'Create repository'" -ForegroundColor White
Write-Host ""

$CREATED = Read-Host "Have you created the repository on GitHub? (y/n)"

if ($CREATED -ne "y" -and $CREATED -ne "Y") {
    Write-Host "❌ Please create the repository first, then run this script again" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔗 Adding remote..." -ForegroundColor Cyan
git remote add origin "https://github.com/$GITHUB_USER/kaizen-systems.git"

Write-Host "📦 Renaming branch to main..." -ForegroundColor Cyan
git branch -M main

Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your website will be live at:" -ForegroundColor Cyan
Write-Host "   https://$GITHUB_USER.github.io/kaizen-systems/" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Go to: https://github.com/$GITHUB_USER/kaizen-systems/settings/pages" -ForegroundColor White
Write-Host "   2. Under 'Source', select: Branch 'main', folder '/ (root)'" -ForegroundColor White
Write-Host "   3. Click 'Save'" -ForegroundColor White
Write-Host "   4. Wait 1-2 minutes for GitHub to build" -ForegroundColor White
Write-Host "   5. Your site will be live!" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Happy launching!" -ForegroundColor Magenta