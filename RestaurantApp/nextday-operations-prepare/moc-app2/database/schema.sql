-- 営業準備業務データベーススキーマ（moc-app2用）
-- moc-appと同じスキーマ + 楽観ロック対応（version列）

-- 場所マスタ
CREATE TABLE place (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- 補充元先区分
    name VARCHAR(255) NOT NULL, -- 場所名
    display_order INTEGER, -- 表示順序
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 品物マスタ
CREATE TABLE item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL, -- 品物名
    description TEXT, -- 説明
    unit VARCHAR(50), -- 単位
    pattern_type VARCHAR(50), -- 補充パターン区分（code）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 品物別前日営業準備マスタ
CREATE TABLE item_replenishment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES item(id),
    source_location_id UUID NOT NULL REFERENCES place(id),
    destination_location_id UUID NOT NULL REFERENCES place(id),
    replenishment_type VARCHAR(50) NOT NULL, -- 補充パターン区分
    order_request_destination VARCHAR(255), -- 作成・発注依頼先
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 品物準備マスタ
CREATE TABLE item_preparation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES item(id),
    location_id UUID NOT NULL REFERENCES place(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 在庫補充状況管理トラン
CREATE TABLE inventory_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_date DATE NOT NULL, -- 業務日付
    item_id UUID NOT NULL REFERENCES item(id),
    inventory_check_status VARCHAR(50) NOT NULL DEFAULT '01', -- 在庫確認ステータス（code）
    replenishment_status VARCHAR(50) NOT NULL DEFAULT '99', -- 補充ステータス（code）
    preparation_status VARCHAR(50) NOT NULL DEFAULT '99', -- 作成ステータス（code）
    order_request_status VARCHAR(50) NOT NULL DEFAULT '99', -- 発注依頼ステータス（code）
    inventory_count INTEGER DEFAULT 0, -- 在庫数
    replenishment_count INTEGER DEFAULT 0, -- 補充数
    replenishment_note TEXT, -- 補充メモ
    version INTEGER DEFAULT 0 NOT NULL, -- 楽観ロック用バージョン列
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_date, item_id)
);

-- 商品予約トラン
CREATE TABLE reservation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_date DATE NOT NULL, -- 業務日付
    product_name TEXT NOT NULL, -- 商品名
    reservation_count INTEGER NOT NULL, -- 予約数
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 予約状況トラン
CREATE TABLE reservation_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_date DATE NOT NULL, -- 業務日付
    memo TEXT, -- メモ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_place_type ON place(type);
CREATE INDEX idx_place_display_order ON place(display_order);
CREATE INDEX idx_item_replenishment_item_id ON item_replenishment(item_id);
CREATE INDEX idx_item_replenishment_source_location ON item_replenishment(source_location_id);
CREATE INDEX idx_item_replenishment_destination_location ON item_replenishment(destination_location_id);
CREATE INDEX idx_inventory_status_business_date ON inventory_status(business_date);
CREATE INDEX idx_inventory_status_item_id ON inventory_status(item_id);
CREATE INDEX idx_reservation_business_date ON reservation(business_date);
CREATE INDEX idx_reservation_status_business_date ON reservation_status(business_date);

-- 更新日時の自動更新トリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルに更新日時トリガーを設定
CREATE TRIGGER update_place_updated_at BEFORE UPDATE ON place FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_item_updated_at BEFORE UPDATE ON item FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_item_replenishment_updated_at BEFORE UPDATE ON item_replenishment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_item_preparation_updated_at BEFORE UPDATE ON item_preparation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_status_updated_at BEFORE UPDATE ON inventory_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservation_updated_at BEFORE UPDATE ON reservation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservation_status_updated_at BEFORE UPDATE ON reservation_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
