package com.example.anonymousmemo.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * 投稿作成リクエストDTO
 */
public class PostRequest {
    
    @NotBlank(message = "投稿内容は必須です")
    @Size(max = 1000, message = "投稿内容は1000文字以内で入力してください")
    private String content;
    
    // デフォルトコンストラクタ
    public PostRequest() {}
    
    // コンストラクタ
    public PostRequest(String content) {
        this.content = content;
    }
    
    // Getter/Setter
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    @Override
    public String toString() {
        return "PostRequest{" +
                "content='" + content + '\'' +
                '}';
    }
}
