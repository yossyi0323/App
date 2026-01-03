# テストデータ投入スクリプト（PowerShell版）
# 使用法: .\insert-test-data.ps1

param(
    [string]$DatabaseName = "operations_prepare_moc2",
    [string]$DbHost = "localhost",
    [int]$Port = 5432,
    [string]$User = "postgres",
    [string]$Password = "",
    [string]$SchemaFile = "..\database\schema.sql",
    [string]$TestDataFile = "..\database\test-data.sql"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "テストデータ投入スクリプト (moc-app2)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 環境変数からパスワードを取得
if ([string]::IsNullOrEmpty($Password)) {
    $Password = $env:PGPASSWORD
}

if ([string]::IsNullOrEmpty($Password)) {
    Write-Host "エラー: PostgreSQLのパスワードが指定されていません。" -ForegroundColor Red
    Write-Host "環境変数 PGPASSWORD を設定するか、-Password パラメータで指定してください。" -ForegroundColor Yellow
    exit 1
}

# ファイルパスを解決
$SchemaPath = Join-Path $PSScriptRoot $SchemaFile
$TestDataPath = Join-Path $PSScriptRoot $TestDataFile

if (-not (Test-Path $TestDataPath)) {
    Write-Host "エラー: テストデータファイルが見つかりません: $TestDataPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "データベース: $DatabaseName" -ForegroundColor Green
Write-Host "ホスト: ${DbHost}:$Port" -ForegroundColor Green
Write-Host "ユーザー: $User" -ForegroundColor Green
Write-Host "テストデータファイル: $TestDataPath" -ForegroundColor Green
Write-Host ""

# PostgreSQL接続文字列を設定
$env:PGPASSWORD = $Password

try {
    Write-Host "テストデータを投入しています..." -ForegroundColor Yellow
    
    # UTF-8エンコーディングでファイルを読み込んで投入
    $content = Get-Content $TestDataPath -Encoding UTF8 -Raw
    $env:PGCLIENTENCODING = "UTF8"
    $content | & psql -h $DbHost -p $Port -U $User -d $DatabaseName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "テストデータの投入が完了しました。" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "エラー: テストデータの投入に失敗しました。" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "エラー: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # 環境変数をクリア
    if ([string]::IsNullOrEmpty($env:PGPASSWORD)) {
        Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    }
}

