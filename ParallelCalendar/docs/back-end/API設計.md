# API設計

## 認証
Google認証でいきたい


## タイムスロット
### 取得
GET /timeSlots

カレンダー表示に必要な全データを取得する。
フロントエンドは、このレスポンスをそのままループさせるだけで「予定のレーン」「実績のレーン」を描画できる。

#### Request
*   Query Parameters:
    *   `startAt`: `2026-01-01T00:00:00+09:00` (必須)
    *   `endAt`: `2026-01-31T23:59:59+09:00` (必須)

#### Response
```json
{
    "timeSlots": [
        {
            "id": "slot-001",
            "taskId": "task-abc",
            "type": "PLAN", // "PLAN" | "ACTUAL" | "CUST＄OM"
            "title": "英語学習",
            "description": "単語帳P.1-10",
            "startAt": "2026-01-01T10:00:00+09:00",
            "endAt": "2026-01-01T11:00:00+09:00"
        }
    ]  
}
```

GET /timeSlots/{id}

#### Request
#### Response
```json
{
    "id": "slot-001",
    "taskId": "task-abc",
    "type": "PLAN", // "PLAN" | "ACTUAL" | "CUST＄OM"
    "title": "英語学習",
    "description": "単語帳P.1-10",
    "startAt": "2026-01-01T10:00:00+09:00",
    "endAt": "2026-01-01T11:00:00+09:00"
}
```

### 作成
POST /timeSlots

#### Request
```json
{
    "taskId": "task-abc",
    "type": "PLAN", // "PLAN" | "ACTUAL" | "CUST＄OM"
    "title": "英語学習",
    "description": "単語帳P.1-10",
    "startAt": "2026-01-01T10:00:00+09:00",
    "endAt": "2026-01-01T11:00:00+09:00"
}
```
#### Response

### 更新
PUT /timeSlots/{id}
#### Request
```json
{
    "taskId": "task-abc",
    "type": "PLAN", // "PLAN" | "ACTUAL" | "CUST＄OM"
    "title": "英語学習",
    "description": "単語帳P.1-10",
    "startAt": "2026-01-01T10:00:00+09:00",
    "endAt": "2026-01-01T11:00:00+09:00"
}
```
#### Response

PATCH /timeSlots/{id}
#### Request
#### Response

### 削除
DELETE /timeSlots/{id}
#### Request
#### Response

## タスク

### 取得
GET /tasks
#### Request
#### Response

### 作成
POST /tasks
#### Request
#### Response

### 更新
PUT /tasks/{id}
#### Request
#### Response

PATCH /tasks/{id}
#### Request
#### Response

### 削除
DELETE /tasks/{id}
#### Request
#### Response


