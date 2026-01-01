import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { recipes, recipeComponents, recipeOutputs, stocks, products } from '@/lib/schema';
import { requireAuth } from '@/lib/auth';
import { eq, and, isNull, inArray, sql } from 'drizzle-orm';

// GET /api/recipes/filter-by-stock
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const offset = (page - 1) * limit;

    // ユーザーのストックを取得
    const userStocks = await db
      .select({
        productId: stocks.productId,
        productType: stocks.productType,
        status: stocks.status,
      })
      .from(stocks)
      .where(
        and(
          eq(stocks.userId, user.userId),
          eq(stocks.status, 'AVAILABLE')
        )
      );

    if (userStocks.length === 0) {
      return NextResponse.json({
        recipes: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // ストックの種類に応じてレシピをフィルター
    const productIds = userStocks.map(s => s.productId);
    const productTypes = [...new Set(userStocks.map(s => s.productType))];

    // 完成品: そのまま使えるレシピ（アウトプットが完成品のレシピ）
    // 中間成果物: その中間成果物を使うレシピ（材料が中間成果物のレシピ）
    // 食材: その食材を使うレシピ（材料が食材のレシピ）

    let filteredRecipes: any[] = [];

    // 完成品がある場合
    if (productTypes.includes('final_dish')) {
      const finalDishProductIds = userStocks
        .filter(s => s.productType === 'final_dish')
        .map(s => s.productId);

      const recipesWithFinalDish = await db
        .select({
          recipeId: recipes.recipeId,
          name: recipes.name,
          createdAt: recipes.createdAt,
          updatedAt: recipes.updatedAt,
        })
        .from(recipes)
        .innerJoin(recipeOutputs, eq(recipes.recipeId, recipeOutputs.recipeId))
        .where(
          and(
            eq(recipes.userId, user.userId),
            isNull(recipes.deletedAt),
            inArray(recipeOutputs.productId, finalDishProductIds)
          )
        )
        .groupBy(recipes.recipeId, recipes.name, recipes.createdAt, recipes.updatedAt);

      filteredRecipes.push(...recipesWithFinalDish);
    }

    // 中間成果物がある場合
    if (productTypes.includes('intermediate')) {
      const intermediateProductIds = userStocks
        .filter(s => s.productType === 'intermediate')
        .map(s => s.productId);

      const recipesWithIntermediate = await db
        .select({
          recipeId: recipes.recipeId,
          name: recipes.name,
          createdAt: recipes.createdAt,
          updatedAt: recipes.updatedAt,
        })
        .from(recipes)
        .innerJoin(recipeComponents, eq(recipes.recipeId, recipeComponents.recipeId))
        .where(
          and(
            eq(recipes.userId, user.userId),
            isNull(recipes.deletedAt),
            eq(recipeComponents.inputType, 'PRODUCT'),
            inArray(recipeComponents.productId, intermediateProductIds)
          )
        )
        .groupBy(recipes.recipeId, recipes.name, recipes.createdAt, recipes.updatedAt);

      filteredRecipes.push(...recipesWithIntermediate);
    }

    // 食材がある場合
    if (productTypes.includes('raw_material')) {
      const rawMaterialProductIds = userStocks
        .filter(s => s.productType === 'raw_material')
        .map(s => s.productId);

      const recipesWithRawMaterial = await db
        .select({
          recipeId: recipes.recipeId,
          name: recipes.name,
          createdAt: recipes.createdAt,
          updatedAt: recipes.updatedAt,
        })
        .from(recipes)
        .innerJoin(recipeComponents, eq(recipes.recipeId, recipeComponents.recipeId))
        .where(
          and(
            eq(recipes.userId, user.userId),
            isNull(recipes.deletedAt),
            eq(recipeComponents.inputType, 'PRODUCT'),
            inArray(recipeComponents.productId, rawMaterialProductIds)
          )
        )
        .groupBy(recipes.recipeId, recipes.name, recipes.createdAt, recipes.updatedAt);

      filteredRecipes.push(...recipesWithRawMaterial);
    }

    // 重複を除去
    const uniqueRecipes = Array.from(
      new Map(filteredRecipes.map(r => [r.recipeId, r])).values()
    );

    // ページネーション
    const total = uniqueRecipes.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedRecipes = uniqueRecipes.slice(offset, offset + limit);

    return NextResponse.json({
      recipes: paginatedRecipes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}
