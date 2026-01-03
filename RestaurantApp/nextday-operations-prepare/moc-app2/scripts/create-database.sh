#!/bin/bash
# PostgreSQLデータベース作成スクリプト

DATABASE_NAME="operations_prepare_moc2"
USERNAME="postgres"
HOST="localhost"
PORT="5432"
SCHEMA_FILE="database/schema.sql"

echo "Creating database: $DATABASE_NAME"

# データベースが存在するか確認して削除
if psql -U "$USERNAME" -h "$HOST" -p "$PORT" -lqt | cut -d \| -f 1 | grep -qw "$DATABASE_NAME"; then
    echo "Database $DATABASE_NAME already exists. Dropping..."
    dropdb -U "$USERNAME" -h "$HOST" -p "$PORT" "$DATABASE_NAME"
fi

# データベースを作成
echo "Creating database..."
createdb -U "$USERNAME" -h "$HOST" -p "$PORT" "$DATABASE_NAME"

if [ $? -eq 0 ]; then
    echo "Database created successfully!"
    
    # スキーマを適用
    echo "Applying schema..."
    psql -U "$USERNAME" -h "$HOST" -p "$PORT" -d "$DATABASE_NAME" -f "$SCHEMA_FILE"
    
    if [ $? -eq 0 ]; then
        echo "Schema applied successfully!"
    else
        echo "Failed to apply schema"
        exit 1
    fi
else
    echo "Failed to create database"
    exit 1
fi

