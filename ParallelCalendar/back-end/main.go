package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"

	"back-end/api"
	"back-end/internal/db"
	"back-end/internal/handler"
)

func main() {
	fmt.Println("Hello World!")

	ctx := context.Background()
	connStr := "postgres" + "://" + "postgres" + ":" + "password" + "@localhost:" + "5432" + "/" + "postgres"
	pool, dbErr := pgxpool.New(ctx, connStr)
	if dbErr != nil {
		log.Fatal("データベースへの接続に失敗しました。", dbErr)
	}
	defer pool.Close()

	queries := db.New(pool)

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
}
