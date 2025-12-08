package com.uniwa.operationsprepare.controller;

import com.uniwa.operationsprepare.entity.Item;
import com.uniwa.operationsprepare.service.ItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "品物", description = "品物マスタ管理API")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @Operation(
            summary = "品物を取得",
            description = """
            品物マスタを取得します。クエリパラメータにより、取得条件を指定できます。
            
            ## 処理フロー
            1. クエリパラメータを確認
            2. パラメータに応じて以下のいずれかを実行:
               - `placeId`指定: 指定した場所に関連する品物を取得
               - `destinationId`指定: 指定した補充先に関連する品物を取得
               - `sourceId`指定: 指定した補充元に関連する品物を取得
               - パラメータなし: 全品物を取得
            3. 品物リストを返却
            
            ## クエリパラメータ
            - `placeId`: 場所ID（UUID形式、オプション）
            - `destinationId`: 補充先ID（UUID形式、オプション）
            - `sourceId`: 補充元ID（UUID形式、オプション）
            
            ## 注意事項
            - 複数のパラメータを同時に指定した場合、優先順位は `placeId` > `destinationId` > `sourceId`
            - パラメータなしの場合は全品物を取得
            
            ## レスポンス
            - 成功時: 200 OK - 品物リスト（空の場合は空配列）
            - エラー時: 500 Internal Server Error
            """
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "取得成功"),
        @ApiResponse(responseCode = "500", description = "サーバーエラー")
    })
    @GetMapping
    public ResponseEntity<List<Item>> getAllItems(
            @Parameter(description = "場所ID（UUID形式、オプション）", example = "10000000-0000-0000-0000-000000000001")
            @RequestParam(required = false) String placeId,
            @Parameter(description = "補充先ID（UUID形式、オプション）", example = "10000000-0000-0000-0000-000000000001")
            @RequestParam(required = false) String destinationId,
            @Parameter(description = "補充元ID（UUID形式、オプション）", example = "10000000-0000-0000-0000-000000000001")
            @RequestParam(required = false) String sourceId) {
        if (placeId != null) {
            return ResponseEntity.ok(itemService.getItemsByPlaceId(UUID.fromString(placeId)));
        } else if (destinationId != null) {
            return ResponseEntity.ok(itemService.getItemsByDestinationId(UUID.fromString(destinationId)));
        } else if (sourceId != null) {
            return ResponseEntity.ok(itemService.getItemsBySourceId(UUID.fromString(sourceId)));
        } else {
            return ResponseEntity.ok(itemService.getAllItems());
        }
    }

    @Operation(
            summary = "IDで品物を取得",
            description = """
            指定したIDの品物マスタを取得します。
            
            ## 処理フロー
            1. パスパラメータから品物IDを取得
            2. Service層で該当IDの品物マスタを検索
            3. 品物情報を返却（存在しない場合は404）
            
            ## レスポンス
            - 成功時: 200 OK - 品物情報
            - 存在しない場合: 404 Not Found
            - エラー時: 500 Internal Server Error
            """
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "取得成功"),
        @ApiResponse(responseCode = "404", description = "品物が見つかりません"),
        @ApiResponse(responseCode = "500", description = "サーバーエラー")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(
            @Parameter(description = "品物ID（UUID）", required = true, example = "10000000-0000-0000-0000-000000000010")
            @PathVariable UUID id) {
        return itemService.getItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
