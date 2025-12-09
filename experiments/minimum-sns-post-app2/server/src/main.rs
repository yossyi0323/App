mod db;
mod errors;
mod handlers;
mod models;
mod repositories;

use axum::{
    routing::{get, post},
    Router,
};
use repositories::posts::PostRepository;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load environment variables
    dotenvy::dotenv().ok();

    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://app_user:app_password@localhost/minimum_sns_post_app2".to_string());

    // Create database connection pool
    let pool = db::create_pool(&database_url).await?;

    // Create repository
    let post_repo = Arc::new(PostRepository::new(pool));

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build application routes
    let api_routes = Router::new()
        .route("/api/posts", post(handlers::posts::create_post))
        .route("/api/posts", get(handlers::posts::get_posts))
        .route("/api/posts/:id", get(handlers::posts::get_post))
        .route("/api/posts/:id", axum::routing::put(handlers::posts::update_post))
        .route("/api/posts/:id", axum::routing::delete(handlers::posts::delete_post))
        .with_state(post_repo);

    let app = Router::new()
        .merge(api_routes)
        .nest_service("/", ServeDir::new("../front/dist"))
        .layer(cors);

    // Start server
    let port = std::env::var("SERVER_PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .unwrap_or(8080);

    let addr = format!("0.0.0.0:{}", port);
    println!("Server listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

