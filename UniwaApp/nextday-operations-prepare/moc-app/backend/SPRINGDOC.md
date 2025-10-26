# Springdoc（OpenAPI/Swagger）導入

## 概要
moc-appにSpringdoc OpenAPIを導入し、API仕様書を自動生成できるようにしました。

## アクセス方法

### Swagger UI（ブラウザで見るAPI仕様書）
バックエンド起動後、以下のURLにアクセス：
```
http://localhost:8080/swagger-ui.html
```

### OpenAPI仕様（JSON）
```
http://localhost:8080/api-docs
```

## 導入内容

### 1. 依存関係追加（pom.xml）
```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

### 2. 設定追加（application.yml）
```yaml
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    operations-sorter: alpha
    tags-sorter: alpha
```

### 3. コントローラーにアノテーション追加
- `@Tag`: API全体の説明
- `@Operation`: 各エンドポイントの説明
- `@Parameter`: パラメータの説明

## 使い方

### 1. バックエンドを再起動
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### 2. Swagger UIにアクセス
ブラウザで http://localhost:8080/swagger-ui.html を開く

### 3. APIをブラウザから試せる
- 各エンドポイントの「Try it out」ボタンをクリック
- パラメータを入力して「Execute」
- レスポンスが表示される

## メリット

- **API仕様書が自動生成**：コードとドキュメントが乖離しない
- **ブラウザからAPI実行可能**：Postmanなしでテストできる
- **仕様がひと目でわかる**：パラメータ、レスポンス、エラーなど

## ドキュメント記述方針

### Swagger（@Operation description）
**詳細に書く。実装を日本語に置き換えたレベル。**

必須項目：
- **処理フロー**：SQLクエリレベルで何をしているか
- **返却データ**：何が返るか
- **正常系**：データあり・なしの挙動
- **異常系**：400, 404, 500になる条件
- **パフォーマンス**：インデックス、N+1問題など注意点

例：
```java
@Operation(
    summary = "業務日付で在庫ステータスを取得",
    description = """
        ## 処理フロー
        1. inventory_statusテーブルをbusiness_dateで検索
        2. item情報を外部キー結合（LEFT JOIN）で取得
        3. item.nameで昇順ソート
        
        ## 正常系
        - データあり: 該当する全在庫ステータスを返す
        - データなし: 空配列 [] を返す
        
        ## 異常系
        - businessDate未指定: 400 Bad Request
        """
)
```

### JavaDoc
**最小限。端的な説明 + @param + @return のみ。**

例：
```java
/**
 * 業務日付で在庫ステータスを取得する
 * 
 * @param businessDate 業務日付（YYYY-MM-DD形式）
 * @return 在庫ステータスのリスト
 */
```

詳細はSwagger descriptionに書く。JavaDocに重複して書かない。

## 次のステップ

- [ ] 他のコントローラーにも同じ方針でアノテーション追加
- [ ] エラーレスポンスの定義追加
- [ ] DTOクラスにも説明追加（`@Schema`アノテーション）

