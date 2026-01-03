# Seed data insertion script (PowerShell)
# Usage: .\seed.ps1

param(
    [string]$DatabaseName = "operations_prepare_moc2",
    [string]$DbHost = "localhost",
    [int]$Port = 5432,
    [string]$User = "postgres",
    [string]$Password = "",
    [string]$SeedFile = "seed.sql"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Seed Data Insertion Script (moc-app2)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Get password from environment variable
if ([string]::IsNullOrEmpty($Password)) {
    $Password = $env:PGPASSWORD
}

# Allow empty password (if PostgreSQL is configured without password)

# Resolve file path
$SeedPath = Join-Path $PSScriptRoot $SeedFile

if (-not (Test-Path $SeedPath)) {
    Write-Host "Error: Seed file not found: $SeedPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Database: $DatabaseName" -ForegroundColor Green
Write-Host "Host: ${DbHost}:$Port" -ForegroundColor Green
Write-Host "User: $User" -ForegroundColor Green
Write-Host "Seed file: $SeedPath" -ForegroundColor Green
Write-Host ""

# Set PostgreSQL connection environment variables
$env:PGPASSWORD = $Password
$env:PGCLIENTENCODING = "UTF8"

try {
    Write-Host "Inserting seed data..." -ForegroundColor Yellow
    
    # Set console code page to UTF-8
    chcp 65001 | Out-Null
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    
    # Read file directly using psql -f option (do not use pipe)
    & psql -h $DbHost -p $Port -U $User -d $DatabaseName -f $SeedPath --set=ON_ERROR_STOP=1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Seed data insertion completed successfully." -ForegroundColor Green
        
        # Verify data after insertion
        Write-Host ""
        Write-Host "Verifying data..." -ForegroundColor Yellow
        $result = psql -h $DbHost -p $Port -U $User -d $DatabaseName -t -c "SELECT COUNT(*) FROM place;"
        Write-Host "Place count: $($result.Trim())" -ForegroundColor Green
        $result = psql -h $DbHost -p $Port -U $User -d $DatabaseName -t -c "SELECT COUNT(*) FROM item;"
        Write-Host "Item count: $($result.Trim())" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Error: Seed data insertion failed." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Clear environment variables
    if ([string]::IsNullOrEmpty($env:PGPASSWORD)) {
        Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    }
}
