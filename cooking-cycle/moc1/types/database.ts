// データベース型定義

export type ProductType = 'raw_material' | 'intermediate' | 'final_dish' | 'seasoning' | 'other';
export type StockStatus = 'AVAILABLE' | 'NEED_REFILL' | 'NO_REFILL';
export type InputType = 'PRODUCT' | 'TEXT_INPUT';

export interface User {
  user_id: string;
  email: string;
  name: string;
  picture_url: string | null;
  created_at: Date;
  updated_at: Date;
  updated_count: number;
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  is_stockable: boolean;
  created_at: Date;
  updated_at: Date;
  updated_count: number;
}

export interface Recipe {
  recipe_id: string;
  user_id: string;
  parent_recipe_id: string | null;
  name: string;
  recipe_url: string | null;
  instructions_text: string;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
  updated_count: number;
}

export interface RecipeComponent {
  component_id: string;
  recipe_id: string;
  product_id: string | null;
  ingredient_name: string | null;
  input_type: InputType;
  quantity_memo: string | null;
  is_optional: boolean;
  required_state_transition_id: string | null;
  created_at: Date;
  updated_at: Date;
  updated_count: number;
}

export interface RecipeOutput {
  output_id: string;
  recipe_id: string;
  product_id: string;
  quantity_memo: string | null;
  is_main_output: boolean;
  created_at: Date;
  updated_at: Date;
  updated_count: number;
}

export interface Stock {
  stock_id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_type: ProductType;
  status: StockStatus;
  quantity_memo: string | null;
  state_memo: string | null;
  stocked_since_date: Date;
  created_from_recipe_id: string | null;
  ingredient_id: string | null;
  state_transition_id: string | null;
  created_at: Date;
  updated_at: Date;
  updated_count: number;
}
