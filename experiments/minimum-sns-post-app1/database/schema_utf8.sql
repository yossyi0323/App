-- minimum-sns-post-app1 データベーススキーマ
-- PostgreSQL用DDL (UTF-8 BOMなし)

-- データベース作成（必要に応じて実行）
-- CREATE DATABASE minimum_sns_post_app1;

-- postsテーブル作成
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL CHECK (LENGTH(content) > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);

-- サンプルデータ（開発用）
-- UTF8データベースで日本語テスト
INSERT INTO posts (content) VALUES 
    ('これは最初のテスト投稿です。'),
    ('Vue.js 2とSpring Bootで開発中です！'),
    ('匿名投稿アプリのサンプルメッセージです。')
ON CONFLICT DO NOTHING;
