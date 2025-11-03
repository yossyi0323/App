use leptos::*;
use serde::{Deserialize, Serialize};
use gloo_net::http::Request;
use chrono::{DateTime, Utc};
use wasm_bindgen::prelude::*;
use console_error_panic_hook;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
struct Post {
    id: String,
    content: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Serialize)]
struct CreatePostRequest {
    content: String,
}

#[derive(Clone, Debug, Serialize)]
struct UpdatePostRequest {
    content: String,
}

const API_BASE_URL: &str = "http://localhost:8080";

async fn fetch_posts() -> Result<Vec<Post>, String> {
    let response = Request::get(&format!("{}/api/posts", API_BASE_URL))
        .send()
        .await
        .map_err(|e| format!("Failed to fetch posts: {}", e))?;

    if response.ok() {
        response
            .json::<Vec<Post>>()
            .await
            .map_err(|e| format!("Failed to parse posts: {}", e))
    } else {
        Err(format!("Server error: {}", response.status()))
    }
}

async fn create_post(content: String) -> Result<Post, String> {
    let response = Request::post(&format!("{}/api/posts", API_BASE_URL))
        .json(&CreatePostRequest { content })
        .map_err(|e| format!("Failed to serialize request: {}", e))?
        .send()
        .await
        .map_err(|e| format!("Failed to create post: {}", e))?;

    if response.ok() {
        response
            .json::<Post>()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))
    } else {
        // エラーレスポンスのJSONを読む
        let error_body: serde_json::Value = response.json().await.unwrap_or(serde_json::json!({}));
        let error_msg = error_body.get("error")
            .and_then(|v| v.as_str())
            .unwrap_or("Server error");
        Err(error_msg.to_string())
    }
}

async fn update_post(id: String, content: String) -> Result<Post, String> {
    let response = Request::put(&format!("{}/api/posts/{}", API_BASE_URL, id))
        .json(&UpdatePostRequest { content })
        .map_err(|e| format!("Failed to serialize request: {}", e))?
        .send()
        .await
        .map_err(|e| format!("Failed to update post: {}", e))?;

    if response.ok() {
        response
            .json::<Post>()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))
    } else {
        // エラーレスポンスのJSONを読む
        let error_body: serde_json::Value = response.json().await.unwrap_or(serde_json::json!({}));
        let error_msg = error_body.get("error")
            .and_then(|v| v.as_str())
            .unwrap_or("Server error");
        Err(error_msg.to_string())
    }
}

async fn delete_post(id: String) -> Result<(), String> {
    let response = Request::delete(&format!("{}/api/posts/{}", API_BASE_URL, id))
        .send()
        .await
        .map_err(|e| format!("Failed to delete post: {}", e))?;

    if response.ok() || response.status() == 204 {
        Ok(())
    } else {
        Err(format!("Server error: {}", response.status()))
    }
}

#[component]
pub fn App() -> impl IntoView {
    let (posts, set_posts) = create_signal::<Vec<Post>>(vec![]);
    let (content, set_content) = create_signal(String::new());
    let (editing_id, set_editing_id) = create_signal::<Option<String>>(None);
    let (is_submitting, set_is_submitting) = create_signal(false);
    let (error_message, set_error_message) = create_signal::<Option<String>>(None);

    let load_posts = create_action(move |_: &()| async move {
        match fetch_posts().await {
            Ok(posts) => {
                set_posts.set(posts);
                set_error_message.set(None);
            }
            Err(e) => {
                set_error_message.set(Some(e));
            }
        }
    });

    // Load posts on mount
    create_effect(move |_| {
        load_posts.dispatch(());
    });

    let on_submit = move |ev: leptos::ev::SubmitEvent| {
        ev.prevent_default();
        
        let content_value = content.get();
        if content_value.trim().is_empty() {
            set_error_message.set(Some("投稿内容を入力してください".to_string()));
            return;
        }

        set_is_submitting.set(true);
        set_error_message.set(None);

        let editing_id_value = editing_id.get();

        spawn_local(async move {
            let result = if let Some(id) = editing_id_value {
                update_post(id, content_value).await
            } else {
                create_post(content_value).await
            };

            match result {
                Ok(_) => {
                    set_content.set(String::new());
                    set_editing_id.set(None);
                    load_posts.dispatch(());
                }
                Err(e) => {
                    set_error_message.set(Some(e));
                }
            }
            set_is_submitting.set(false);
        });
    };

    let on_edit = move |post: Post| {
        set_content.set(post.content.clone());
        set_editing_id.set(Some(post.id.clone()));
        set_error_message.set(None);
    };

    let on_cancel_edit = move |_| {
        set_content.set(String::new());
        set_editing_id.set(None);
        set_error_message.set(None);
    };

    let on_delete = move |id: String| {
        if let Some(window) = web_sys::window() {
            if window.confirm_with_message("この投稿を削除しますか？").unwrap_or(false) {
                spawn_local(async move {
                    match delete_post(id).await {
                        Ok(_) => {
                            load_posts.dispatch(());
                            set_error_message.set(None);
                        }
                        Err(e) => {
                            set_error_message.set(Some(e));
                        }
                    }
                });
            }
        }
    };

    view! {
        <div class="container">
            <h1>"匿名投稿メモアプリ"</h1>
            
            {move || error_message.get().map(|msg| {
                view! {
                    <div class="error-message">{msg}</div>
                }
            })}

            <form on:submit=on_submit class="post-form">
                <textarea
                    placeholder="投稿内容を入力..."
                    prop:value=move || content.get()
                    on:input=move |ev| set_content.set(event_target_value(&ev))
                    disabled=move || is_submitting.get()
                />
                <div class="button-group">
                    <button
                        type="submit"
                        disabled=move || is_submitting.get()
                    >
                        {move || if is_submitting.get() {
                            if editing_id.get().is_some() { "保存中..." } else { "送信中..." }
                        } else {
                            if editing_id.get().is_some() { "Save" } else { "Submit" }
                        }}
                    </button>
                    {move || editing_id.get().map(|_| {
                        view! {
                            <button
                                type="button"
                                on:click=on_cancel_edit
                                class="cancel-button"
                            >
                                "Cancel"
                            </button>
                        }
                    })}
                </div>
            </form>

            <div class="posts-list">
                <h2>"投稿一覧"</h2>
                {move || {
                    let posts_list = posts.get();
                    if posts_list.is_empty() {
                        view! {
                            <p class="no-posts">"投稿がありません"</p>
                        }.into_view()
                    } else {
                        posts_list
                            .into_iter()
                            .map(|post| {
                                let post_id_for_delete = post.id.clone();
                                let post_for_edit = post.clone();
                                
                                view! {
                                    <div class="post-item">
                                        <div class="post-content">{post.content.clone()}</div>
                                        <div class="post-meta">
                                            <span class="post-date">
                                                {post.created_at.format("%Y-%m-%d %H:%M").to_string()}
                                            </span>
                                            <div class="post-actions">
                                                <button
                                                    on:click=move |_| on_edit(post_for_edit.clone())
                                                    class="edit-button"
                                                >
                                                    "Edit"
                                                </button>
                                                <button
                                                    on:click=move |_| on_delete(post_id_for_delete.clone())
                                                    class="delete-button"
                                                >
                                                    "Delete"
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                }
                            })
                            .collect_view()
                    }
                }}
            </div>
        </div>
    }
}

#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
    mount_to_body(|| view! { <App /> })
}

