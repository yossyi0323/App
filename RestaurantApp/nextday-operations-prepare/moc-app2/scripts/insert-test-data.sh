#!/bin/bash
# テストデータ投入スクリプト（Bash版）
# 使用法: ./insert-test-data.sh

set -e

DATABASE_NAME="${DATABASE_NAME:-operations_prepare_moc2}"
HOST="${PGHOST:-localhost}"
PORT="${PGPORT:-5432}"
USER="${PGUSER:-postgres}"
SCHEMA_FILE="../database/schema.sql"
TEST_DATA_FILE="../database/test-data.sql"

echo "=========================================="
echo "テストデータ投入スクリプト (moc-app2)"
echo "=========================================="

# ファイルパスを解決
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEST_DATA_PATH="$SCRIPT_DIR/$TEST_DATA_FILE"

if [ ! -f "$TEST_DATA_PATH" ]; then
    echo "エラー: テストデータファイルが見つかりません: $TEST_DATA_PATH" >&2
    exit 1
fi

echo ""
echo "データベース: $DATABASE_NAME"
echo "ホスト: $HOST:$PORT"
echo "ユーザー: $USER"
echo "テストデータファイル: $TEST_DATA_PATH"
echo ""

# PostgreSQL接続文字列を設定
export PGHOST="$HOST"
export PGPORT="$PORT"
export PGUSER="$USER"

echo "テストデータを投入しています..."

# テストデータを投入
psql -d "$DATABASE_NAME" -f "$TEST_DATA_PATH"

if [ $? -eq 0 ]; then
    echo ""
    echo "テストデータの投入が完了しました。"
else
    echo ""
    echo "エラー: テストデータの投入に失敗しました。" >&2
    exit 1
fi


