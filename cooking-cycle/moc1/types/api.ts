// API型定義

import { ProductType, StockStatus, InputType } from './database';

// レシピ関連
export interface CreateRecipeRequest {
  name: string;
  recipe_url?: string;
  instructions_text: string;
  components: RecipeComponentRequest[];
  outputs: RecipeOutputRequest[];
}

export interface RecipeComponentRequest {
  input_type: InputType;
  product_id?: string;
  ingredient_name?: string;
  quantity_memo?: string;
  is_optional?: boolean;
  required_state_transition_id?: string; // Phase 2以降
}

export interface RecipeOutputRequest {
  product_id: string;
  quantity_memo?: string;
  is_main_output?: boolean;
}

export interface RecipeResponse {
  recipe_id: string;
  user_id: string;
  parent_recipe_id: string | null;
  name: string;
  recipe_url: string | null;
  instructions_text: string;
  components: RecipeComponentResponse[];
  outputs: RecipeOutputResponse[];
  created_at: string;
  updated_at: string;
}

export interface RecipeComponentResponse {
  component_id: string;
  product_id: string | null;
  ingredient_name: string | null;
  input_type: InputType;
  quantity_memo: string | null;
  is_optional: boolean;
  required_state_transition_id: string | null;
}

export interface RecipeOutputResponse {
  output_id: string;
  product_id: string;
  product_name: string;
  quantity_memo: string | null;
  is_main_output: boolean;
}

// ストック関連
export interface CreateStockRequest {
  product_name: string;
  product_type: ProductType;
  status: StockStatus;
  quantity_memo?: string;
  state_memo?: string; // Phase 1
  stocked_since_date: string;
  created_from_recipe_id?: string;
  ingredient_id?: string; // Phase 2以降
  state_transition_id?: string; // Phase 2以降
}

export interface StockResponse {
  stock_id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_type: ProductType;
  status: StockStatus;
  quantity_memo: string | null;
  state_memo: string | null;
  stocked_since_date: string;
  created_from_recipe_id: string | null;
  used_in_recipes: RecipeListItem[];
  created_at: string;
  updated_at: string;
}

export interface RecipeListItem {
  recipe_id: string;
  name: string;
}

// 製品関連
export interface CreateProductRequest {
  name: string;
  type: ProductType;
  is_stockable: boolean;
}

export interface ProductResponse {
  id: string;
  name: string;
  type: ProductType;
  is_stockable: boolean;
  created_at: string;
  updated_at: string;
}

// エラーレスポンス
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
