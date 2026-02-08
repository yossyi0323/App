# API設計

## 認証
Google認証でいきたい。暫定的にまずはBasic認証でも良いけど。


## タイムスロット
### 一括取得
GET /timeSlots

カレンダー表示に必要な全データを取得する。
フロントエンドは、このレスポンスをそのままループさせるだけで「予定のレーン」「実績のレーン」を描画できる。

#### Request
*   Query Parameters:
    *   `userId`: `me@yossyi.com` (必須)
    *   `startAt`: `2026-01-01T00:00:00+09:00` (必須)
    *   `endAt`: `2026-01-31T23:59:59+09:00` (必須)

#### Response
time_slotsテーブルのエンティティリストを返す

```json
{
    "timeSlots": [
        {
            "timeSlotId": "slot-001",
            "userId": "me@yossyi.com",
            "taskId": "task-abc",
            "allocation": "PLAN", // "PLAN" | "ACTUAL" | "CUSTOM"
            "extData": {},
            "startAt": "2026-01-01T10:00:00+09:00",
            "endAt": "2026-01-01T11:00:00+09:00",
            "createdBy": "me@yossyi.com",
            "updatedBy": "me@yossyi.com"
        }
    ]  
}
```

### 取得
GET /timeSlots/{id}

#### Request
#### Response
time_slotsテーブルのエンティティを返す
```json
{
    "id": "slot-001",
    "userId": "me@yossyi.com",
    "taskId": "task-abc",
    "allocation": "PLAN", // "PLAN" | "ACTUAL" | "CUSTOM"
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
    "allocation": "PLAN", // "PLAN" | "ACTUAL" | "CUSTOM"
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
    "timeSlotId": "slot-001",
    "taskId": "task-abc",
    "userId": "me@yossyi.com",
    "allocation": "PLAN", // 当面は"PLAN" | "ACTUAL"だけど、今後マスタ設定で自由に増やせるように機能拡張する予定
    "extData": {},
    "startAt": "2026-01-01T10:00:00+09:00",
    "endAt": "2026-01-01T11:00:00+09:00",
    "createdBy": "me@yossyi.com",
    "updatedBy": "me@yossyi.com"
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
*   Query Parameters:
    *   `userId`: `me@yossyi.com` (必須)

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
#### Request
tasksテーブルのエンティティを返す
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



### 削除
DELETE /tasks/{id}
#### Request
tasksテーブルのエンティティを削除する
#### Response


