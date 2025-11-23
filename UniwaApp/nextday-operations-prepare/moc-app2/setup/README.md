# シードデータ投入

このフォルダには、開発用のシードデータを投入するためのスクリプトとファイルが含まれています。

## ファイル構成

- `seed.sql`: シードデータのSQLファイル（UTF-8エンコーディング）
- `seed.ps1`: PowerShell用の投入スクリプト
- `seed.sh`: Bash用の投入スクリプト

## 使用方法

### PowerShell（Windows）

```powershell
cd setup
.\seed.ps1
```

### Bash（Linux/Mac）

```bash
cd setup
chmod +x seed.sh
./seed.sh
```

## 注意事項

- このスクリプトは既存のデータを削除しません。重複エラーが発生する場合は、事前にデータを削除してください
- シードファイルはUTF-8エンコーディングで保存されています
- PostgreSQLのクライアントエンコーディングをUTF-8に設定して実行されます

## データ削除

既存のデータを削除する場合：

```sql
TRUNCATE TABLE reservation_status, reservation, inventory_status, item_preparation, item_replenishment, item, place CASCADE;
```

または、PowerShellから：

```powershell
psql -U postgres -d operations_prepare_moc2 -c "TRUNCATE TABLE reservation_status, reservation, inventory_status, item_preparation, item_replenishment, item, place CASCADE;"
```

