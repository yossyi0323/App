# バックエンド用 Dockerfile
FROM openjdk:17-jdk-slim

# 作業ディレクトリを設定
WORKDIR /app

# Mavenラッパーとpom.xmlをコピー
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# 依存関係をダウンロード（キャッシュ効率化）
RUN ./mvnw dependency:go-offline

# ソースコードをコピー
COPY src src

# アプリケーションをビルド
RUN ./mvnw clean package -DskipTests

# 実行可能JARファイルを指定
EXPOSE 8080

# アプリケーション起動コマンド
CMD ["java", "-jar", "target/minimum-sns-post-app1-api-1.0.0.jar", "--spring.profiles.active=prod"]
