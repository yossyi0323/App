# start.ps1
# バックエンドとフロントエンドを起動するスクリプト（テストなし版）

Write-Host "🚀 アプリケーション起動中..." -ForegroundColor Cyan

# バックエンド起動
Write-Host "`n📦 バックエンド起動中..." -ForegroundColor Yellow
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; mvn spring-boot:run" -PassThru

# 少し待つ
Start-Sleep -Seconds 2

# フロントエンド起動
Write-Host "🌐 フロントエンド起動中..." -ForegroundColor Yellow
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev" -PassThru

Write-Host "`n✅ アプリケーション起動完了！" -ForegroundColor Green
Write-Host "バックエンド: http://localhost:8080" -ForegroundColor White
Write-Host "フロントエンド: http://localhost:3000" -ForegroundColor White
Write-Host "`n" -NoNewline
Write-Host "終了するには各ウィンドウで Ctrl+C を押してください" -ForegroundColor Yellow
Write-Host "またはこのスクリプトを終了すると自動的に両方のプロセスを停止します" -ForegroundColor Yellow

# スクリプト終了時の処理
$null = Register-EngineEvent PowerShell.Exiting -Action {
    Write-Host "`nアプリケーションを終了します..." -ForegroundColor Yellow
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
}

# ユーザーの入力待ち
Write-Host "`nEnterキーを押すとこのスクリプトを終了し、起動したプロセスも停止します..." -ForegroundColor Cyan
Read-Host

# プロセスを停止
Write-Host "アプリケーションを終了します..." -ForegroundColor Yellow
Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
Write-Host "終了しました。" -ForegroundColor Green

