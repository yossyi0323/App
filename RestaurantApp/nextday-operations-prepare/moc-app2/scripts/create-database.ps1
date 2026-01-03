# PostgreSQLデータベース作成スクリプト
# 使用方法: powershell -ExecutionPolicy Bypass -File create-database.ps1

$env:PGPASSWORD = ""
$databaseName = "operations_prepare_moc2"
$username = "postgres"
$dbHost = "localhost"
$port = "5432"
$schemaFile = "database\schema.sql"

Write-Host "Creating database: $databaseName" -ForegroundColor Green

# データベースが存在するか確認
$dbExists = psql -U $username -h $dbHost -p $port -lqt | Select-String -Pattern "\b$databaseName\b"

if ($dbExists) {
    Write-Host "Database $databaseName already exists. Dropping..." -ForegroundColor Yellow
    dropdb -U $username -h $dbHost -p $port $databaseName
}

# データベースを作成
Write-Host "Creating database..." -ForegroundColor Green
createdb -U $username -h $dbHost -p $port $databaseName

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database created successfully!" -ForegroundColor Green
    
    # スキーマを適用（UTF-8エンコーディングを指定）
    Write-Host "Applying schema..." -ForegroundColor Green
    $content = Get-Content $schemaFile -Encoding UTF8 -Raw
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText((Resolve-Path $schemaFile), $content, $utf8NoBom)
    $env:PGCLIENTENCODING = "UTF8"
    Get-Content $schemaFile -Encoding UTF8 | psql -U $username -h $dbHost -p $port -d $databaseName --set=ON_ERROR_STOP=1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Schema applied successfully!" -ForegroundColor Green
    } else {
        Write-Host "Failed to apply schema" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Failed to create database" -ForegroundColor Red
    exit 1
}

