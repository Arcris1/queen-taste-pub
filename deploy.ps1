# =====================================================
# deploy.ps1 - Cache-bust + commit + push in one command.
# Usage:
#   .\deploy.ps1                          (auto commit msg)
#   .\deploy.ps1 "Updated drink prices"   (custom commit msg)
# =====================================================

param(
  [string]$Message = ""
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# 1. Generate a fresh build version (down to the minute)
$build = Get-Date -Format "yyyyMMddHHmm"
Write-Host ""
Write-Host "==> Bumping build version to: $build" -ForegroundColor Cyan

# 2. Rewrite ?v=... in every HTML file so browsers fetch fresh CSS/JS
$htmlFiles = Get-ChildItem -Path . -Filter "*.html"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# Regex: match version between ?v= and the next " (closing href quote)
$pattern = '(?<=\.(?:css|js)\?v=)[^"]+'

foreach ($f in $htmlFiles) {
  $content = [System.IO.File]::ReadAllText($f.FullName)
  $updated = [regex]::Replace($content, $pattern, $build)
  if ($content -ne $updated) {
    [System.IO.File]::WriteAllText($f.FullName, $updated, $utf8NoBom)
    Write-Host "    bumped $($f.Name)" -ForegroundColor DarkGray
  }
}

# 3. Stage / commit / push
$gitStatus = git status --porcelain
if (-not $gitStatus) {
  Write-Host ""
  Write-Host "Nothing to push - working tree clean." -ForegroundColor Yellow
  exit 0
}

if ([string]::IsNullOrWhiteSpace($Message)) {
  $Message = "Update site (build $build)"
}

Write-Host ""
Write-Host "==> Committing: $Message" -ForegroundColor Cyan
git add .
git commit -m $Message
if ($LASTEXITCODE -ne 0) { Write-Host "commit failed" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "==> Pushing to GitHub..." -ForegroundColor Cyan
git push
if ($LASTEXITCODE -ne 0) { Write-Host "push failed" -ForegroundColor Red; exit 1 }

$buildUrl = "https://arcris1.github.io/queen-taste-pub/"
Write-Host ""
Write-Host "Done. Live at $buildUrl in ~1 minute." -ForegroundColor Green
Write-Host "Phones will fetch fresh CSS/JS thanks to v=$build" -ForegroundColor Green
