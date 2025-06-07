DROP TABLE IF EXISTS inventory_status, item, item_preparation, place, reservation, reservation_status CASCADE;

-- 在庫補充状況管理
CREATE TABLE inventory_status (
    inventory_status_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_date DATE NOT NULL,
    item_id UUID NOT NULL,
    check_status TEXT NOT NULL DEFAULT '01',
    replenishment_status TEXT NOT NULL DEFAULT '01',
    preparation_status TEXT NOT NULL DEFAULT '01',
    order_status TEXT NOT NULL DEFAULT '01',
    current_stock INTEGER,
    replenishment_count INTEGER,
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 品物マスタ
CREATE TABLE item (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 品物別前日営業準備
CREATE TABLE item_preparation (
    item_preparation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL,
    preparation_type TEXT NOT NULL DEFAULT '01',
    source_place_id UUID NOT NULL,
    destination_place_id UUID NOT NULL,
    preparation_contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 場所マスタ
CREATE TABLE place (
    place_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_type TEXT NOT NULL DEFAULT '01',
    place_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 予約
CREATE TABLE reservation (
    reservation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_date TIMESTAMP WITH TIME ZONE NOT NULL,
    product_name TEXT NOT NULL,
    reservation_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_business_date_product_name UNIQUE (business_date, product_name)
);

-- 予約ステータス
CREATE TABLE reservation_status (
    reservation_status_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_date TIMESTAMP WITH TIME ZONE NOT NULL,
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

