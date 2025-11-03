use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::errors::AppError;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Post {
    pub id: Uuid,
    pub content: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreatePostRequest {
    pub content: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePostRequest {
    pub content: String,
}

impl CreatePostRequest {
    pub fn validate(&self) -> Result<(), AppError> {
        let len = self.content.trim().chars().count();

        if len == 0 {
            return Err(AppError::EmptyContent);
        }

        if len < 10 || len > 500 {
            return Err(AppError::ContentLengthInvalid {
                min: 10,
                max: 500,
                current: len
            });
        }

        Ok(())
    }
}

impl UpdatePostRequest {
    pub fn validate(&self) -> Result<(), AppError> {
        let len = self.content.trim().chars().count();

        if len == 0 {
            return Err(AppError::EmptyContent);
        }

        if len < 10 || len > 500 {
            return Err(AppError::ContentLengthInvalid {
                min: 10,
                max: 500,
                current: len
            });
        }

        Ok(())
    }
}

