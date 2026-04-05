# Pin-Liang Build Script (Encoding Fix)
# We use English in Write-Host to avoid PowerShell encoding errors

Write-Host "--- GitHub Uploader v1.0 ---" -ForegroundColor Cyan

# 1. Git Init
git init

# 2. Add and Commit
git add .
git commit -m "initial commit for Pin-Liang English app"

# 3. Remote URL
Write-Host "-------------------------------------------" -ForegroundColor Yellow
$remotepath = Read-Host "Paste your GitHub URL (https://github.com/sanyi246751/english.git)"
Write-Host "-------------------------------------------" -ForegroundColor Yellow

# 4. Remote Path Setup
git remote remove origin 2>$null
git remote add origin $remotepath
git branch -M main

# 5. Push to GitHub
Write-Host "Uploading to GitHub... Please login if popup window shows up." -ForegroundColor Yellow
git push -u origin main

Write-Host "SUCCESS! Your code is on GitHub now." -ForegroundColor Green

pause
