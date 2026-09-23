# =====================================================
# deploy.ps1 - Cache-bust + commit + publish to the VPS + push to GitHub.
# Live site: https://queen-taste-pub.digitalapps.tech/
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

# 3. Commit (skipped when the tree is clean, so a re-sync still works)
if ([string]::IsNullOrWhiteSpace($Message)) {
  $Message = "Update site (build $build)"
}

$gitStatus = git status --porcelain
if ($gitStatus) {
  Write-Host ""
  Write-Host "==> Committing: $Message" -ForegroundColor Cyan
  git add .
  git commit -m $Message
  if ($LASTEXITCODE -ne 0) { Write-Host "commit failed" -ForegroundColor Red; exit 1 }
} else {
  Write-Host ""
  Write-Host "Working tree clean - re-publishing the current commit." -ForegroundColor Yellow
}

# 4. Publish the committed site files to the VPS.
#    Only what is committed ships, so uncommitted or gitignored files (like `ssh`)
#    never reach the server. rsync syncs INTO site/ rather than swapping the
#    directory: the container bind-mounts site/, and a renamed directory would
#    leave it serving the old one.
$VpsHost = "silang@72.62.78.114"
$Remote  = "~/apps/queen-taste-menu"
$SiteUrl = "https://queen-taste-pub.digitalapps.tech/"
$tar = Join-Path $env:TEMP "queen-taste-site.tar"

Write-Host ""
Write-Host "==> Publishing to the VPS..." -ForegroundColor Cyan
git archive -o $tar HEAD -- . ':(exclude)deploy' ':(exclude)deploy.ps1' ':(exclude)README.md' ':(exclude).gitignore'
if ($LASTEXITCODE -ne 0) { Write-Host "git archive failed" -ForegroundColor Red; exit 1 }

scp -q $tar "${VpsHost}:/tmp/queen-taste-site.tar"
if ($LASTEXITCODE -ne 0) { Write-Host "upload failed" -ForegroundColor Red; exit 1 }

ssh $VpsHost "set -e; cd $Remote; rm -rf site.new; mkdir site.new; tar -xf /tmp/queen-taste-site.tar -C site.new; rsync -a --delete site.new/ site/; rm -rf site.new /tmp/queen-taste-site.tar"
if ($LASTEXITCODE -ne 0) { Write-Host "publish on VPS failed" -ForegroundColor Red; exit 1 }
Remove-Item $tar -ErrorAction SilentlyContinue

# 5. Verify the live page is serving this build
$live = (Invoke-WebRequest -Uri $SiteUrl -UseBasicParsing -Headers @{ "Cache-Control" = "no-cache" }).Content
$localVersion = [regex]::Match([System.IO.File]::ReadAllText((Join-Path $PSScriptRoot "index.html")), $pattern).Value
if ($localVersion -and $live -notmatch [regex]::Escape("v=$localVersion")) {
  Write-Host "Live page does not show v=$localVersion - check the VPS." -ForegroundColor Red
  exit 1
}

# 6. Push to GitHub as the source backup (not the live host any more)
Write-Host ""
Write-Host "==> Pushing to GitHub..." -ForegroundColor Cyan
git push
if ($LASTEXITCODE -ne 0) {
  Write-Host "push failed - the site IS live, only the GitHub backup is behind" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done. Live at $SiteUrl" -ForegroundColor Green
Write-Host "Phones will fetch fresh CSS/JS thanks to v=$build" -ForegroundColor Green
exit 0
