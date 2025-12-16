# Go WebAssembly デモ

GoでWebAssembly（WASM）を使ってフロントエンドを作成するサンプルです。

## 使い方

### 1. WebAssemblyファイルをビルド

```bash
cd wasm

# Go 1.16以降の場合
GOOS=js GOARCH=wasm go build -o main.wasm main.go

# Windows PowerShellの場合
$env:GOOS="js"; $env:GOARCH="wasm"; go build -o main.wasm main.go
```

### 2. wasm_exec.jsをコピー

**注意**: Go 1.22以降では、`wasm_exec.js`の場所が変更されました。
- 旧場所（Go 1.21以前）: `$GOROOT/misc/wasm/wasm_exec.js`
- 新場所（Go 1.22以降）: `$GOROOT/lib/wasm/wasm_exec.js`

```bash
# Go 1.22以降の場合（Linux/Mac）
cp "$(go env GOROOT)/lib/wasm/wasm_exec.js" .

# Windows PowerShellの場合（Go 1.22以降）
Copy-Item "$(go env GOROOT)\lib\wasm\wasm_exec.js" .
```

### 3. ローカルサーバーで実行

WebAssemblyはCORSの制約があるため、ローカルサーバーが必要です。

```bash
# Python 3の場合
python -m http.server 8080

# Node.js (http-server)の場合
npx http-server -p 8080

# Goの場合
go run -m http.server -p 8080
```

### 4. ブラウザでアクセス

```
http://127.0.0.1:8080/index.html
```

**注意**: 
- `http://localhost:8080/`ではなく、`/index.html`を明示的に指定してください
- Windowsでは`localhost`が正しく解決されない場合があるため、`127.0.0.1`を使用することを推奨します
- ディレクトリリストが表示されている場合は、そこから`index.html`をクリックしても構いません

## ファイル構成

- `main.go`: Goで書かれたWebAssemblyコード
- `index.html`: HTMLファイル（WebAssemblyを読み込む）
- `wasm_exec.js`: GoのWebAssemblyランタイム
- `main.wasm`: コンパイルされたWebAssemblyバイナリ（ビルド後に生成）

## 動作説明

- 入力フィールドにテキストを入力
- ボタンをクリック（またはEnterキー）で結果を表示
- クリック回数もカウント
- すべてGoのコードで実装

## 注意事項

- WebAssemblyは最新のブラウザで動作します
- ローカルファイル（file://）から直接開くことはできません（CORS制約）
- 必ずHTTPサーバー経由でアクセスしてください

