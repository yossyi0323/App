---
description: 作業ログの自動生成（AppとObsidian VaultのGit, AIとのChat, ObsidianのPeriodicNotesをもとに回答）
---

1. **対象期間の特定**:
   - ユーザーに「いつの作業ログを生成しますか？」と尋ねる。
   - 「昨日」「今日」などの相対日時や、「YYYY-MM-DD」などの指定を受け付ける。
   - 指定がない場合は、直近24時間をデフォルトとするか確認する。

2. **AppリポジトリのGitログ取得と詳細確認**:
   - 以下のコマンドを実行し、`App` ディレクトリのコミット履歴を取得する。
     ```bash
     cd c:\Users\YOSHITO\Documents\App
     git log --since="<START_TIME>" --until="<END_TIME>" --date=format:'%Y-%m-%d %H:%M:%S' --pretty=format:'%cd [%h] %s' --author="YOSHITO" --all --stat
     ```
   - **詳細確認**: コミットメッセージが抽象的な場合やすべての変更ファイルを確認したい場合は、以下のコマンドで差分を確認する。
     ```bash
     git --no-pager show --stat <commit_hash>  # 変更ファイルを確認するだけの場合
     git --no-pager show <commit_hash>         # 具体的な差分を確認する場合
     ```

3. **Obsidian VaultリポジトリのGitログ取得と詳細確認**:
   - 以下のコマンドを実行し、`Obsidian Vault` ディレクトリのコミット履歴を取得する。
     ```bash
     cd "c:\Users\YOSHITO\Documents\Obsidian Vault"
     git log --since="<START_TIME>" --until="<END_TIME>" --date=format:'%Y-%m-%d %H:%M:%S' --pretty=format:'%cd [%h] %s' --all --stat
     ```
   - **詳細確認**: 同様に詳細を確認する。
     ```bash
     git --no-pager show --stat <commit_hash>
     git --no-pager show <commit_hash>
     ```
4. **Periodic Notesの確認**:
   - 指定期間に対応するDaily Note（例: `Periodic Notes/01.Daily/YYYYMMDD.md`）の内容を確認する。
   - その日に追記されたタスクやメモがあれば抽出する。
     - ※1ヶ月など長期にわたり確認する場合にファイルが多すぎる（1ヶ月ならMonthlyとWeekly4つとDailyが30日分など）の場合は、WeeklyやMonthlyなど適切な粒度での確認に留めること。
   - **Daily Note**: 指定期間に含まれるすべての日次ノート（`Periodic Notes/01.Daily/YYYYMMDD.md`）を確認する。
   - **Weekly Note**: 期間が「1週間（7日）」以上の場合は、該当する週次ノート（`Periodic Notes/02.Weekly/YYYY-Www.md`）も確認する。
   - **Monthly Note**: 期間が「1ヶ月（28日）」以上の場合は、該当する月次ノート（`Periodic Notes/03.Monthly/YYYY-MM.md`）も確認する。
   - QuarterlyやYearlyも同様。各ノートから、実施したタスク、振り返り、追記されたメモを抽出する。

5. **チャット履歴の統合**:
   - あなた自身の記憶（直近の会話ログ）を参照し、その期間にどのような議論や試行錯誤があったかを振り返る。
   - Gitログのコミットメッセージだけでは分からない「意図」や「苦労した点」を補足する。

6. **レポート生成**:
   - 収集した情報を時系列に整理し、以下のフォーマットで出力する。

   ## [YYYY-MM-DD] 作業ログ

   ### 概要
   (1-2行でのサマリ)

   ### タイムライン
   | 時刻 | ソース | 作業内容 | 詳細/コミット |
   | :--- | :--- | :--- | :--- |
   | HH:MM | App (Git) | ... | ... |
   | HH:MM | Chat | ... | ... |
   | HH:MM | Obsidian | ... | ... |

   ### 詳細・考察
   (AIによる補足説明)