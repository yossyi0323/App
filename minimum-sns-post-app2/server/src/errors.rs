use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("投稿が見つかりません: ID {0}")]
    PostNotFound(String),

    #[error("投稿内容が空です")]
    EmptyContent,

    #[error("投稿は{min}文字以上{max}文字以内で入力してください（現在：{current}文字）")]
    ContentLengthInvalid { min: usize, max: usize, current: usize },

    #[error("データベースエラー: {0}")]
    DatabaseError(#[from] sqlx::Error),

    #[allow(dead_code)]
    #[error("内部サーバーエラー: {0}")]
    InternalError(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AppError::PostNotFound(id) => (
                StatusCode::NOT_FOUND,
                json!({ "error": format!("投稿が見つかりません: ID {}", id) }),
            ),
            AppError::EmptyContent => (
                StatusCode::BAD_REQUEST,
                json!({ "error": "content は空にできません" }),
            ),
            AppError::ContentLengthInvalid { min, max, current } => (
                StatusCode::BAD_REQUEST,
                json!({ 
                    "error": format!(
                        "投稿は{}文字以上{}文字以内で入力してください（現在：{}文字）",
                        min, max, current
                    )
                }),
            ),
            AppError::DatabaseError(ref e) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                json!({ "error": format!("データベースエラー: {}", e) }),
            ),
            AppError::InternalError(ref e) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                json!({ "error": format!("内部サーバーエラー: {}", e) }),
            ),
        };

        (status, Json(error_message)).into_response()
    }
}

pub type AppResult<T> = Result<T, AppError>;




