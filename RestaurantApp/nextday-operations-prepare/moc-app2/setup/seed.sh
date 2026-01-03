#!/bin/bash
# シードデータ投入スクリプト（Bash版）
# 使用法: ./seed.sh

set -e

DATABASE_NAME="${DATABASE_NAME:-operations_prepare_moc2}"
DB_HOST="${DB_HOST:-localhost}"
PORT="${PORT:-5432}"
USER="${USER:-postgres}"
SEED_FILE="${SEED_FILE:-seed.sql}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SEED_PATH="${SCRIPT_DIR}/${SEED_FILE}"

echo "=========================================="
echo "シードデータ投入スクリプト (moc-app2)"
echo "=========================================="
echo ""
echo "データベース: $DATABASE_NAME"
echo "ホスト: ${DB_HOST}:${PORT}"
echo "ユーザー: $USER"
echo "シードファイル: $SEED_PATH"
echo ""

if [ ! -f "$SEED_PATH" ]; then
    echo "エラー: シードファイルが見つかりません: $SEED_PATH"
    exit 1
fi

echo "シードデータを投入しています..."

# UTF-8エンコーディングで投入
export PGCLIENTENCODING=UTF8
psql -h "$DB_HOST" -p "$PORT" -U "$USER" -d "$DATABASE_NAME" -f "$SEED_PATH" --set=ON_ERROR_STOP=1

if [ $? -eq 0 ]; then
    echo ""
    echo "シードデータの投入が完了しました。"
    
    # データ投入後の確認
    echo ""
    echo "データ投入後の確認中..."
    PLACE_COUNT=$(psql -h "$DB_HOST" -p "$PORT" -U "$USER" -d "$DATABASE_NAME" -t -c "SELECT COUNT(*) FROM place;")
    ITEM_COUNT=$(psql -h "$DB_HOST" -p "$PORT" -U "$USER" -d "$DATABASE_NAME" -t -c "SELECT COUNT(*) FROM item;")
    echo "場所マスタ: $(echo $PLACE_COUNT | tr -d ' ') 件"
    echo "品物マスタ: $(echo $ITEM_COUNT | tr -d ' ') 件"
else
    echo ""
    echo "エラー: シードデータの投入に失敗しました。"
    exit 1
fi

