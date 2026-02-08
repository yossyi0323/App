# API設計

## 認証
Google認証でいきたい。暫定的にまずはBasic認証でも良いけど。


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
time_slotsテーブルのエンティティリストを返す

```json
{
    "timeSlots": [
        {
            "id": "slot-001",
            "userId": "me@yossyi.com",
            "taskId": "task-abc",
            "type": "PLAN", // "PLAN" | "ACTUAL" | "CUST＄OM"
            "title": "英語学習",
            "description": "単語帳P.1-10",
            "extData": {},
            "startAt": "2026-01-01T10:00:00+09:00",
            "endAt": "2026-01-01T11:00:00+09:00",
            "createdBy": "me@yossyi.com",
            "updatedBy": "me@yossyi.com"
        }
    ]  
}
```

GET /timeSlots/{id}

#### Request
#### Response
time_slotsテーブルのエンティティを返す
```json
{
    "id": "slot-001",
    "userId": "me@yossyi.com",
    "taskId": "task-abc",
    "type": "PLAN", // "PLAN" | "ACTUAL" | "CUST＄OM"
    "title": "英語学習",
    "description": "単語帳P.1-10",
    "extData": {},
    "startAt": "2026-01-01T10:00:00+09:00",
    "endAt": "2026-01-01T11:00:00+09:00",
    "createdBy": "me@yossyi.com",
    "updatedBy": "me@yossyi.com"
}
```

### 作成
POST /timeSlots

#### Request
time_slotsテーブルのエンティティを作成する
```json
{
    "taskId": "task-abc",
    "userId": "me@yossyi.com",
    "type": "PLAN", // "PLAN" | "ACTUAL" | "CUST＄OM"
    "title": "英語学習",
    "description": "単語帳P.1-10",
    "extData": {},
    "startAt": "2026-01-01T10:00:00+09:00",
    "endAt": "2026-01-01T11:00:00+09:00",
    "createdBy": "me@yossyi.com",
    "updatedBy": "me@yossyi.com"
}
```
#### Response

### 更新
PUT /timeSlots/{id}
#### Request
time_slotsテーブルのエンティティを更新する
```json
{
    "taskId": "task-abc",
    "userId": "me@yossyi.com",
    "type": "PLAN", // "PLAN" | "ACTUAL" | "CUST＄OM"
    "title": "英語学習",
    "description": "単語帳P.1-10",
    "extData": {},
    "startAt": "2026-01-01T10:00:00+09:00",
    "endAt": "2026-01-01T11:00:00+09:00",
    "createdBy": "me@yossyi.com",
    "updatedBy": "me@yossyi.com"
}
```
#### Response

PATCH /timeSlots/{id}
#### Request
time_slotsテーブルのエンティティを更新する
```json
{
    "taskId": "task-abc",
    "endAt": "2026-01-01T18:00:00+09:00"
}
```

#### Response

### 削除
DELETE /timeSlots/{id}
#### Request
time_slotsテーブルのエンティティを削除する
#### Response

## タスク

### 一括取得
GET /tasks
#### Request
tasksテーブルのエンティティリストを返す
```json
    tasks {
        "taskId": "",
        "userId": "me@yossyi.com",
        "title": "",
        "description": "",
        "createdAt": "",
        "updatedAt": "",
        "createdBy": "",
        "updatedBy": ""
    }
```

### 取得
GET /tasks/{id}
#### Request
tasksテーブルのエンティティリストを返す
```json
    tasks {
        "taskId": "",
        "userId": "me@yossyi.com",
        "title": "",
        "description": "",
        "createdAt": "",
        "updatedAt": "",
        "createdBy": "",
        "updatedBy": ""
    }
```

#### Response

### 作成
POST /tasks
#### Request
tasksテーブルのエンティティを作成する
```json
{
    "userId": "me@yossyi.com",
    "title": "英語学習",
    "description": "単語帳P.1-10",
    "createdBy": "me@yossyi.com",
    "updatedBy": "me@yossyi.com"
}
```
#### Response

### 更新
PUT /tasks/{id}
#### Request
tasksテーブルのエンティティを更新する
```json
{
    "userId": "me@yossyi.com",
    "title": "英語学習",
    "description": "単語帳P.1-10",
    "createdBy": "me@yossyi.com",
    "updatedBy": "me@yossyi.com"
}
```
#### Response

PATCH /tasks/{id}
#### Request
tasksテーブルのエンティティを更新する
```json
{
    "userId": "me@yossyi.com",
    "title": "英語学習",
    "description": "単語帳P.1-10",
    "createdBy": "me@yossyi.com",
    "updatedBy": "me@yossyi.com"
}
```
#### Response

### 削除
DELETE /tasks/{id}
#### Request
tasksテーブルのエンティティを削除する
#### Response


