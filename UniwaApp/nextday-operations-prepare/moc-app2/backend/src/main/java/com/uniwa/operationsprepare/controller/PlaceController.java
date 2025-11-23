package com.uniwa.operationsprepare.controller;

import com.uniwa.operationsprepare.entity.Place;
import com.uniwa.operationsprepare.service.PlaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/places")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "場所", description = "場所マスタ管理API")
public class PlaceController {

    @Autowired
    private PlaceService placeService;

    @Operation(
        summary = "全場所を取得",
        description = """
            全ての場所マスタを取得します。
            
            ## 処理フロー
            1. Service層で全場所マスタを検索
            2. 場所リストを返却
            
            ## レスポンス
            - 成功時: 200 OK - 場所リスト（空の場合は空配列）
            - エラー時: 500 Internal Server Error
            """
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "取得成功"),
        @ApiResponse(responseCode = "500", description = "サーバーエラー")
    })
    @GetMapping
    public ResponseEntity<List<Place>> getAllPlaces() {
        try {
            List<Place> places = placeService.getAllPlaces();
            return ResponseEntity.ok(places);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @Operation(
        summary = "タイプで場所を取得",
        description = """
            指定したタイプの場所マスタを取得します。
            
            ## 処理フロー
            1. パスパラメータから場所タイプを取得
            2. Service層で該当タイプの場所マスタを検索
            3. 場所リストを返却
            
            ## 場所タイプ
            - "01": 補充先
            - "02": 補充元
            
            ## レスポンス
            - 成功時: 200 OK - 場所リスト（空の場合は空配列）
            - エラー時: 500 Internal Server Error
            """
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "取得成功"),
        @ApiResponse(responseCode = "500", description = "サーバーエラー")
    })
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Place>> getPlacesByType(
            @Parameter(description = "場所タイプ（\"01\"=補充先, \"02\"=補充元）", required = true, example = "01")
            @PathVariable String type) {
        List<Place> places = placeService.getPlacesByType(type);
        return ResponseEntity.ok(places);
    }

    @Operation(
        summary = "補充元を取得",
        description = """
            補充元（タイプ="02"）の場所マスタを取得します。
            
            ## 処理フロー
            1. Service層でタイプ="02"の場所マスタを検索
            2. 場所リストを返却
            
            ## レスポンス
            - 成功時: 200 OK - 補充元の場所リスト（空の場合は空配列）
            - エラー時: 500 Internal Server Error
            """
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "取得成功"),
        @ApiResponse(responseCode = "500", description = "サーバーエラー")
    })
    @GetMapping("/source")
    public ResponseEntity<List<Place>> getSourcePlaces() {
        List<Place> places = placeService.getPlacesByType("02");
        return ResponseEntity.ok(places);
    }

    @Operation(
        summary = "補充先を取得",
        description = """
            補充先（タイプ="01"）の場所マスタを取得します。
            
            ## 処理フロー
            1. Service層でタイプ="01"の場所マスタを検索
            2. 場所リストを返却
            
            ## レスポンス
            - 成功時: 200 OK - 補充先の場所リスト（空の場合は空配列）
            - エラー時: 500 Internal Server Error
            """
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "取得成功"),
        @ApiResponse(responseCode = "500", description = "サーバーエラー")
    })
    @GetMapping("/destination")
    public ResponseEntity<List<Place>> getDestinationPlaces() {
        List<Place> places = placeService.getPlacesByType("01");
        return ResponseEntity.ok(places);
    }
}


