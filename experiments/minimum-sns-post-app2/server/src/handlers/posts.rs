use crate::errors::AppResult;
use crate::models::post::{CreatePostRequest, Post, UpdatePostRequest};
use crate::repositories::posts::PostRepository;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

pub async fn create_post(
    State(repo): State<Arc<PostRepository>>,
    Json(request): Json<CreatePostRequest>,
) -> AppResult<(StatusCode, Json<Post>)> {
    let post = repo.create(&request).await?;
    Ok((StatusCode::CREATED, Json(post)))
}

pub async fn get_posts(
    State(repo): State<Arc<PostRepository>>,
) -> AppResult<Json<Vec<Post>>> {
    let posts = repo.find_all().await?;
    Ok(Json(posts))
}

pub async fn get_post(
    State(repo): State<Arc<PostRepository>>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Post>> {
    let post = repo.find_by_id(id).await?;
    Ok(Json(post))
}

pub async fn update_post(
    State(repo): State<Arc<PostRepository>>,
    Path(id): Path<Uuid>,
    Json(request): Json<UpdatePostRequest>,
) -> AppResult<Json<Post>> {
    let post = repo.update(id, &request).await?;
    Ok(Json(post))
}

pub async fn delete_post(
    State(repo): State<Arc<PostRepository>>,
    Path(id): Path<Uuid>,
) -> AppResult<StatusCode> {
    repo.delete(id).await?;
    Ok(StatusCode::NO_CONTENT)
}

