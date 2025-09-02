# バックエンド用 Dockerfile
FROM openjdk:17-jdk-slim

# 作業ディレクトリを設定
WORKDIR /app

# Mavenとcurlをインストール
RUN apt-get update && apt-get install -y maven curl && rm -rf /var/lib/apt/lists/*

# pom.xmlをコピー
COPY pom.xml .

# 依存関係をダウンロード（キャッシュ効率化）
RUN mvn dependency:go-offline

# ソースコードをコピー
COPY src src

# アプリケーションをビルド
RUN mvn clean package -DskipTests

# 実行可能JARファイルを指定
EXPOSE 8080

# アプリケーション起動コマンド
CMD ["java", "-jar", "target/minimum-sns-post-app1-api-1.0.0.jar", "--spring.profiles.active=prod"]
