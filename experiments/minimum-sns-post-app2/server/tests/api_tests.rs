use reqwest::{Client, StatusCode};
use serde_json::{json, Value};
use std::time::Duration;
use tokio::time::sleep;

const BASE_URL: &str = "http://localhost:8080";

async fn setup() -> Client {
    Client::new()
}

async fn cleanup_all_posts(client: &Client) {
    if let Ok(response) = client.get(&format!("{}/api/posts", BASE_URL)).send().await {
        if let Ok(posts) = response.json::<Vec<Value>>().await {
            for post in posts {
                if let Some(id) = post.get("id").and_then(|v| v.as_str()) {
                    let _ = client
                        .delete(&format!("{}/api/posts/{}", BASE_URL, id))
                        .send()
                        .await;
                }
            }
        }
    }
}

#[tokio::test]
async fn test_create_post_success() {
    let client = setup().await;
    cleanup_all_posts(&client).await;

    let response = client
        .post(&format!("{}/api/posts", BASE_URL))
        .json(&json!({ "content": "Test post" }))
        .send()
        .await
        .expect("Failed to send request");

    assert_eq!(response.status(), StatusCode::CREATED);

    let post: Value = response.json().await.expect("Failed to parse JSON");
    assert!(post.get("id").is_some());
    assert_eq!(post.get("content").and_then(|v| v.as_str()), Some("Test post"));
    assert!(post.get("created_at").is_some());
    assert!(post.get("updated_at").is_some());

    cleanup_all_posts(&client).await;
}

#[tokio::test]
async fn test_create_post_empty_content() {
    let client = setup().await;

    let response = client
        .post(&format!("{}/api/posts", BASE_URL))
        .json(&json!({ "content": "" }))
        .send()
        .await
        .expect("Failed to send request");

    assert_eq!(response.status(), StatusCode::BAD_REQUEST);

    let error: Value = response.json().await.expect("Failed to parse JSON");
    assert!(error.get("error").is_some());
}

#[tokio::test]
async fn test_get_all_posts() {
    let client = setup().await;
    cleanup_all_posts(&client).await;

    // Create test posts
    client
        .post(&format!("{}/api/posts", BASE_URL))
        .json(&json!({ "content": "First post" }))
        .send()
        .await
        .expect("Failed to create first post");

    sleep(Duration::from_millis(100)).await;

    client
        .post(&format!("{}/api/posts", BASE_URL))
        .json(&json!({ "content": "Second post" }))
        .send()
        .await
        .expect("Failed to create second post");

    let response = client
        .get(&format!("{}/api/posts", BASE_URL))
        .send()
        .await
        .expect("Failed to send request");

    assert_eq!(response.status(), StatusCode::OK);

    let posts: Vec<Value> = response.json().await.expect("Failed to parse JSON");
    assert_eq!(posts.len(), 2);
    
    // Check if posts are sorted by created_at DESC (newest first)
    assert_eq!(posts[0].get("content").and_then(|v| v.as_str()), Some("Second post"));
    assert_eq!(posts[1].get("content").and_then(|v| v.as_str()), Some("First post"));

    cleanup_all_posts(&client).await;
}

#[tokio::test]
async fn test_get_all_posts_empty() {
    let client = setup().await;
    cleanup_all_posts(&client).await;

    let response = client
        .get(&format!("{}/api/posts", BASE_URL))
        .send()
        .await
        .expect("Failed to send request");

    assert_eq!(response.status(), StatusCode::OK);

    let posts: Vec<Value> = response.json().await.expect("Failed to parse JSON");
    assert_eq!(posts.len(), 0);
}

#[tokio::test]
async fn test_get_post_by_id() {
    let client = setup().await;
    cleanup_all_posts(&client).await;

    let create_response = client
        .post(&format!("{}/api/posts", BASE_URL))
        .json(&json!({ "content": "Test post" }))
        .send()
        .await
        .expect("Failed to create post");

    let created_post: Value = create_response.json().await.expect("Failed to parse JSON");
    let post_id = created_post.get("id").and_then(|v| v.as_str()).expect("ID not found");

    let response = client
        .get(&format!("{}/api/posts/{}", BASE_URL, post_id))
        .send()
        .await
        .expect("Failed to send request");

    assert_eq!(response.status(), StatusCode::OK);

    let post: Value = response.json().await.expect("Failed to parse JSON");
    assert_eq!(post.get("id").and_then(|v| v.as_str()), Some(post_id));
    assert_eq!(post.get("content").and_then(|v| v.as_str()), Some("Test post"));

    cleanup_all_posts(&client).await;
}

#[tokio::test]
async fn test_get_post_not_found() {
    let client = setup().await;

    let fake_uuid = "00000000-0000-0000-0000-000000000000";
    let response = client
        .get(&format!("{}/api/posts/{}", BASE_URL, fake_uuid))
        .send()
        .await
        .expect("Failed to send request");

    assert_eq!(response.status(), StatusCode::NOT_FOUND);

    let error: Value = response.json().await.expect("Failed to parse JSON");
    assert!(error.get("error").is_some());
}

#[tokio::test]
async fn test_update_post_success() {
    let client = setup().await;
    cleanup_all_posts(&client).await;

    let create_response = client
        .post(&format!("{}/api/posts", BASE_URL))
        .json(&json!({ "content": "Original content" }))
        .send()
        .await
        .expect("Failed to create post");

    let created_post: Value = create_response.json().await.expect("Failed to parse JSON");
    let post_id = created_post.get("id").and_then(|v| v.as_str()).expect("ID not found");
    let created_at = created_post.get("created_at").and_then(|v| v.as_str()).expect("created_at not found");

    sleep(Duration::from_millis(100)).await;

    let response = client
        .put(&format!("{}/api/posts/{}", BASE_URL, post_id))
        .json(&json!({ "content": "Updated content" }))
        .send()
        .await
        .expect("Failed to send request");

    assert_eq!(response.status(), StatusCode::OK);

    let updated_post: Value = response.json().await.expect("Failed to parse JSON");
    assert_eq!(updated_post.get("content").and_then(|v| v.as_str()), Some("Updated content"));
    assert_eq!(updated_post.get("created_at").and_then(|v| v.as_str()), Some(created_at));
    
    let updated_at = updated_post.get("updated_at").and_then(|v| v.as_str()).expect("updated_at not found");
    assert_ne!(created_at, updated_at);

    cleanup_all_posts(&client).await;
}

#[tokio::test]
async fn test_update_post_empty_content() {
    let client = setup().await;
    cleanup_all_posts(&client).await;

    let create_response = client
        .post(&format!("{}/api/posts", BASE_URL))
        .json(&json!({ "content": "Original content" }))
        .send()
        .await
        .expect("Failed to create post");

    let created_post: Value = create_response.json().await.expect("Failed to parse JSON");
    let post_id = created_post.get("id").and_then(|v| v.as_str()).expect("ID not found");

    let response = client
        .put(&format!("{}/api/posts/{}", BASE_URL, post_id))
        .json(&json!({ "content": "" }))
        .send()
        .await
        .expect("Failed to send request");

    assert_eq!(response.status(), StatusCode::BAD_REQUEST);

    cleanup_all_posts(&client).await;
}

#[tokio::test]
async fn test_update_post_not_found() {
    let client = setup().await;

    let fake_uuid = "00000000-0000-0000-0000-000000000000";
    let response = client
        .put(&format!("{}/api/posts/{}", BASE_URL, fake_uuid))
        .json(&json!({ "content": "Updated content" }))
        .send()
        .await
        .expect("Failed to send request");

    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_delete_post_success() {
    let client = setup().await;
    cleanup_all_posts(&client).await;

    let create_response = client
        .post(&format!("{}/api/posts", BASE_URL))
        .json(&json!({ "content": "To be deleted" }))
        .send()
        .await
        .expect("Failed to create post");

    let created_post: Value = create_response.json().await.expect("Failed to parse JSON");
    let post_id = created_post.get("id").and_then(|v| v.as_str()).expect("ID not found");

    let delete_response = client
        .delete(&format!("{}/api/posts/{}", BASE_URL, post_id))
        .send()
        .await
        .expect("Failed to send request");

    assert_eq!(delete_response.status(), StatusCode::NO_CONTENT);

    let get_response = client
        .get(&format!("{}/api/posts/{}", BASE_URL, post_id))
        .send()
        .await
        .expect("Failed to send request");

    assert_eq!(get_response.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_delete_post_not_found() {
    let client = setup().await;

    let fake_uuid = "00000000-0000-0000-0000-000000000000";
    let response = client
        .delete(&format!("{}/api/posts/{}", BASE_URL, fake_uuid))
        .send()
        .await
        .expect("Failed to send request");

    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_delete_post_twice() {
    let client = setup().await;
    cleanup_all_posts(&client).await;

    let create_response = client
        .post(&format!("{}/api/posts", BASE_URL))
        .json(&json!({ "content": "To be deleted" }))
        .send()
        .await
        .expect("Failed to create post");

    let created_post: Value = create_response.json().await.expect("Failed to parse JSON");
    let post_id = created_post.get("id").and_then(|v| v.as_str()).expect("ID not found");

    client
        .delete(&format!("{}/api/posts/{}", BASE_URL, post_id))
        .send()
        .await
        .expect("Failed to send first delete request");

    let second_delete_response = client
        .delete(&format!("{}/api/posts/{}", BASE_URL, post_id))
        .send()
        .await
        .expect("Failed to send second delete request");

    assert_eq!(second_delete_response.status(), StatusCode::NOT_FOUND);
}

