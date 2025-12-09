# フロントエンド用 Dockerfile
FROM node:16-alpine as build

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonをコピー
COPY package.json ./

# 依存関係をインストール（package-lock.jsonを無視して新しく生成）
RUN npm install

# ソースコードをコピー
COPY . .

# プロダクション用にビルド
RUN npm run build

# Nginxを使用してアプリケーションを配信
FROM nginx:alpine

# ビルドしたファイルをNginxの公開ディレクトリにコピー
COPY --from=build /app/dist /usr/share/nginx/html

# Nginxの設定ファイルをコピー（SPA用）
COPY nginx.conf /etc/nginx/nginx.conf

# ポート80を公開
EXPOSE 80

# Nginxを起動
CMD ["nginx", "-g", "daemon off;"]
