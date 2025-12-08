package com.uniwa.operationsprepare.controller;

import com.uniwa.operationsprepare.entity.InventoryStatus;
import com.uniwa.operationsprepare.service.InventoryStatusService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory-status")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "在庫ステータス", description = "在庫確認業務のステータス管理API")
public class InventoryStatusController {

    @Autowired
    private InventoryStatusService inventoryStatusService;

    @Operation(
            summary = "業務日付で在庫ステータスを取得",
            description = """
            指定した業務日付の全在庫ステータスを取得します。
            
            ## 処理フロー
            1. リクエストパラメータから業務日付を取得
            2. Service層で該当日付の在庫ステータスを検索
            3. 品物情報（Item）をJOINして取得
            4. 在庫ステータスリストを返却
            
            ## レスポンス
            - 成功時: 200 OK - 在庫ステータスリスト（空の場合は空配列）
            - エラー時: 500 Internal Server Error
            """
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "取得成功"),
        @ApiResponse(responseCode = "500", description = "サーバーエラー")
    })
    @GetMapping
    public ResponseEntity<List<InventoryStatus>> getInventoryStatusByDate(
            @Parameter(description = "業務日付（YYYY-MM-DD形式）", required = true, example = "2025-09-27")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate businessDate) {
        List<InventoryStatus> statuses = inventoryStatusService.getInventoryStatusByDate(businessDate);
        return ResponseEntity.ok(statuses);
    }

    @Operation(
            summary = "IDで在庫ステータスを取得",
            description = """
            指定したIDの在庫ステータスを取得します。
            
            ## 処理フロー
            1. パスパラメータから在庫ステータスIDを取得
            2. Service層で該当IDの在庫ステータスを検索
            3. 品物情報（Item）をJOINして取得
            4. 在庫ステータスを返却（存在しない場合は404）
            
            ## レスポンス
            - 成功時: 200 OK - 在庫ステータス
            - 存在しない場合: 404 Not Found
            - エラー時: 500 Internal Server Error
            """
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "取得成功"),
        @ApiResponse(responseCode = "404", description = "在庫ステータスが見つかりません"),
        @ApiResponse(responseCode = "500", description = "サーバーエラー")
    })
    @GetMapping("/{id}")
    public ResponseEntity<InventoryStatus> getInventoryStatusById(
            @Parameter(description = "在庫ステータスID（UUID）", required = true, example = "bdf2f911-6420-4014-9813-b7ffcfd7e9af")
            @PathVariable UUID id) {
        return inventoryStatusService.getInventoryStatusById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
            summary = "在庫ステータスを一括保存",
            description = """
            複数の在庫ステータスを一括で保存します。
            
            ## 処理フロー
            1. リクエストボディから在庫ステータスリストを取得
            2. 各在庫ステータスについて、IDの有無で新規作成/更新を判定
            3. 新規作成: IDがnullまたは空文字の場合、新規作成
            4. 更新: IDが存在する場合、楽観ロックチェック付きで更新
            5. 全ての保存処理が完了したら200 OKを返却
            
            ## 注意事項
            - 一括保存中に楽観ロックエラーが発生した場合、その時点で処理が中断される
            - トランザクション管理: Service層で@Transactionalが適用される
            
            ## レスポンス
            - 成功時: 200 OK
            - 楽観ロックエラー時: 409 Conflict（最初にエラーが発生したアイテムで中断）
            - エラー時: 500 Internal Server Error
            """
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "一括保存成功"),
        @ApiResponse(responseCode = "409", description = "楽観ロックエラー（他のユーザーが更新済み）"),
        @ApiResponse(responseCode = "500", description = "サーバーエラー")
    })
    @PostMapping("/bulk")
    public ResponseEntity<Void> saveInventoryStatusesBulk(
            @Parameter(description = "在庫ステータスリスト", required = true)
            @RequestBody List<InventoryStatus> inventoryStatuses) {
        inventoryStatusService.saveInventoryStatusesBulk(inventoryStatuses);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "在庫ステータスを新規作成",
            description = """
            新しい在庫ステータスを作成します。
            
            ## 処理フロー
            1. リクエストボディから在庫ステータス情報を取得
            2. IDがnullまたは空文字の場合、UUIDを自動生成
            3. versionがnullの場合、0に初期化
            4. データベースにINSERT
            5. 作成後の在庫ステータス（品物情報含む）を再取得して返却
            
            ## リクエストボディ
            - `businessDate`: 業務日付（必須）
            - `itemId`: 品物ID（必須）
            - `inventoryCheckStatus`: 在庫確認ステータス（デフォルト: "01" = 未確認）
            - `replenishmentStatus`: 補充ステータス（デフォルト: "99" = 不要）
            - `preparationStatus`: 作成ステータス（デフォルト: "99" = 不要）
            - `orderRequestStatus`: 発注依頼ステータス（デフォルト: "99" = 不要）
            - `inventoryCount`: 在庫数（デフォルト: 0）
            - `replenishmentCount`: 補充数（デフォルト: 0）
            - `replenishmentNote`: 補充メモ（デフォルト: 空文字）
            - `id`: 指定不要（自動生成）
            - `version`: 指定不要（自動で0に初期化）
            
            ## レスポンス
            - 成功時: 200 OK - 作成された在庫ステータス（品物情報含む）
            - エラー時: 500 Internal Server Error
            """
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "作成成功", content = @Content(schema = @Schema(implementation = InventoryStatus.class))),
        @ApiResponse(responseCode = "500", description = "サーバーエラー")
    })
    @PostMapping
    public ResponseEntity<InventoryStatus> createInventoryStatus(
            @Parameter(description = "在庫ステータス情報（IDとversionは自動設定）", required = true)
            @RequestBody InventoryStatus inventoryStatus) {
        InventoryStatus savedStatus = inventoryStatusService.saveInventoryStatus(inventoryStatus);
        return ResponseEntity.ok(savedStatus);
    }

    @Operation(
            summary = "在庫ステータスを更新（楽観ロック対応）",
            description = """
            既存の在庫ステータスを更新します。楽観ロック（version列）による競合検出に対応しています。
            
            ## 処理フロー
            1. パスパラメータから在庫ステータスIDを取得
            2. リクエストボディから在庫ステータス情報を取得
            3. リクエストボディのIDをパスパラメータのIDで上書き（整合性確保）
            4. Service層で楽観ロックチェック付き更新を実行
               - SQL: `UPDATE inventory_status SET ... WHERE id = ? AND version = ?`
               - 更新件数が0の場合、楽観ロックエラー（409 Conflict）
            5. 更新成功時、最新の在庫ステータス（品物情報含む）を再取得して返却
            
            ## 楽観ロックの仕組み
            - リクエストボディの`version`フィールドに、現在のバージョン番号を指定
            - データベースの`version`列と一致する場合のみ更新成功
            - 更新成功時、`version`は自動的に+1される
            - 更新失敗時（version不一致）、409 Conflictを返却
            
            ## リクエストボディ
            - `id`: パスパラメータと一致する必要がある（パスパラメータで上書きされる）
            - `version`: **必須** - 現在のバージョン番号（楽観ロック用）
            - その他のフィールド: 更新したい値を指定
            
            ## レスポンス
            - 成功時: 200 OK - 更新された在庫ステータス（品物情報含む、versionは+1された値）
            - 楽観ロックエラー時: 409 Conflict - エラーメッセージ（"Version mismatch. The data has been updated by another user."）
            - 存在しない場合: 404 Not Found
            - エラー時: 500 Internal Server Error
            
            ## エラーハンドリング
            - 409 Conflictが返却された場合、フロントエンドは最新データを再取得して表示を更新する必要がある
            - フロントエンドの`@tools/auto-save`（reactive-manager）が409 Conflictを検出し、`SaveState.CONFLICT`を設定
            """
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "更新成功", content = @Content(schema = @Schema(implementation = InventoryStatus.class))),
        @ApiResponse(responseCode = "409", description = "楽観ロックエラー（他のユーザーが更新済み）", content = @Content(schema = @Schema(example = "{\"message\": \"Conflict: Version mismatch. The data has been updated by another user.\"}"))),
        @ApiResponse(responseCode = "404", description = "在庫ステータスが見つかりません"),
        @ApiResponse(responseCode = "500", description = "サーバーエラー")
    })
    @PutMapping("/{id}")
    public ResponseEntity<InventoryStatus> updateInventoryStatus(
            @Parameter(description = "在庫ステータスID（UUID）", required = true, example = "bdf2f911-6420-4014-9813-b7ffcfd7e9af")
            @PathVariable UUID id,
            @Parameter(description = "在庫ステータス情報（versionフィールドが必須）", required = true)
            @RequestBody InventoryStatus inventoryStatus) {
        inventoryStatus.setId(id);
        InventoryStatus savedStatus = inventoryStatusService.saveInventoryStatus(inventoryStatus);
        return ResponseEntity.ok(savedStatus);
    }

    @Operation(
            summary = "在庫ステータスを削除",
            description = """
            指定したIDの在庫ステータスを削除します。
            
            ## 処理フロー
            1. パスパラメータから在庫ステータスIDを取得
            2. Service層で該当IDの在庫ステータスを削除
            3. 削除成功時、204 No Contentを返却
            
            ## レスポンス
            - 成功時: 204 No Content
            - 存在しない場合: 404 Not Found（実装により異なる可能性）
            - エラー時: 500 Internal Server Error
            """
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "削除成功"),
        @ApiResponse(responseCode = "500", description = "サーバーエラー")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventoryStatus(
            @Parameter(description = "在庫ステータスID（UUID）", required = true, example = "bdf2f911-6420-4014-9813-b7ffcfd7e9af")
            @PathVariable UUID id) {
        inventoryStatusService.deleteInventoryStatus(id);
        return ResponseEntity.noContent().build();
    }
}
