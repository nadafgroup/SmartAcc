# reset.ps1
Write-Host "Cleaning project..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

Write-Host "Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

Write-Host "Starting application..." -ForegroundColor Green
npm run dev