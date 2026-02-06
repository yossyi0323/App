package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"back-end/api"
	"back-end/internal/db"
	"back-end/internal/handler"
)

func main() {

	fmt.Println("Hello World!")

	// .envファイルを読み込む
	err := godotenv.Load()
	if err != nil {
		log.Fatal("環境変数の読み込みに失敗しました。", err)
	}
	log.Println("環境変数の読み込みに成功しました。")

	ctx := context.Background()

	pool, queries, err := connectDB(ctx)
	if err != nil {
		log.Fatal("データベースへの接続に失敗しました。", err)
	}
	defer pool.Close()
	log.Println("データベースへの接続に成功しました。")

	server := handler.NewServer(queries)

	// Chiのルーター
	r := chi.NewRouter()

	// ミドルウェアの設定
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.URLFormat)
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			next.ServeHTTP(w, r)
		})
	})

	// OpenAPIで生成されたハンドラをルーターに登録
	api.HandlerFromMux(server, r)

	serverErr := http.ListenAndServe(":8080", r)
	if serverErr != nil {
		log.Fatal("サーバーの起動に失敗しました。：", serverErr)
	}
	log.Println("サーバーの起動に成功しました。")
}

func connectDB(ctx context.Context) (*pgxpool.Pool, *db.Queries, error) {

	// 環境変数の取得
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		dbUser,
		dbPassword,
		dbHost,
		dbPort,
		dbName,
	)
	pool, err := pgxpool.New(ctx, connStr)
	if err != nil {
		return nil, nil, fmt.Errorf("DB接続プールの作成に失敗: %w", err)
	}

	return pool, db.New(pool), nil
}
