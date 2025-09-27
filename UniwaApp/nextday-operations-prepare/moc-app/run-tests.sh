#!/bin/bash

echo "🧪 テスト実行開始..."

# バックエンドテスト実行
echo "📦 バックエンドテスト実行中..."
cd backend
mvn test
if [ $? -eq 0 ]; then
    echo "✅ バックエンドテスト完了"
else
    echo "❌ バックエンドテスト失敗"
    exit 1
fi

# フロントエンドテスト実行
echo "🌐 フロントエンドテスト実行中..."
cd ../frontend
npm run test
if [ $? -eq 0 ]; then
    echo "✅ フロントエンドテスト完了"
else
    echo "❌ フロントエンドテスト失敗"
    exit 1
fi

echo "🎉 全テスト完了！"
