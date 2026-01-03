# start-with-tests.ps1
# バックエンドとフロントエンドのテストを実行してから、両方を起動するスクリプト

Write-Host "🧪 起動前テスト実行開始..." -ForegroundColor Cyan

# バックエンドテスト実行
Write-Host "`n📦 バックエンドテスト実行中..." -ForegroundColor Yellow
Set-Location backend
$backendTestResult = & mvn test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ バックエンドテスト失敗 - 起動を中止します" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ バックエンドテスト完了" -ForegroundColor Green

# フロントエンドテスト実行
Write-Host "`n🌐 フロントエンドテスト実行中..." -ForegroundColor Yellow
Set-Location ../frontend
$frontendTestResult = & npm run test -- --run
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ フロントエンドテスト失敗 - 起動を中止します" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ フロントエンドテスト完了" -ForegroundColor Green

Write-Host "`n🎉 全テスト完了！アプリケーションを起動します..." -ForegroundColor Green

# 元のディレクトリに戻る
Set-Location ..

# バックエンド起動
Write-Host "`n🚀 バックエンド起動中..." -ForegroundColor Cyan
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; mvn spring-boot:run" -PassThru

# フロントエンド起動
Write-Host "🌐 フロントエンド起動中..." -ForegroundColor Cyan
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

