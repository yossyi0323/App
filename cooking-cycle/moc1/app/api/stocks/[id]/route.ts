import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stocks, products, recipeComponents, recipes } from '@/lib/schema';
import { requireAuth } from '@/lib/auth';
import { eq, and, isNull } from 'drizzle-orm';
import { z } from 'zod';

// GET /api/stocks/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const stockId = params.id;

    // ストックを取得
    const [stock] = await db
      .select()
      .from(stocks)
      .where(
        and(
          eq(stocks.stockId, stockId),
          eq(stocks.userId, user.userId)
        )
      )
      .limit(1);

    if (!stock) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'ストックが見つかりません' } },
        { status: 404 }
      );
    }

    // このストックを使うレシピを取得（RECIPE_COMPONENTSから逆引き）
    const usedInRecipes = await db
      .select({
        recipeId: recipes.recipeId,
        name: recipes.name,
      })
      .from(recipes)
      .innerJoin(recipeComponents, eq(recipes.recipeId, recipeComponents.recipeId))
      .where(
        and(
          eq(recipeComponents.productId, stock.productId),
          eq(recipes.userId, user.userId),
          isNull(recipes.deletedAt)
        )
      )
      .groupBy(recipes.recipeId, recipes.name);

    return NextResponse.json({
      stock: {
        ...stock,
        usedInRecipes,
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

// PUT /api/stocks/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const stockId = params.id;
    const body = await request.json();

    // ストックの所有権を確認
    const [existingStock] = await db
      .select()
      .from(stocks)
      .where(
        and(
          eq(stocks.stockId, stockId),
          eq(stocks.userId, user.userId)
        )
      )
      .limit(1);

    if (!existingStock) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'ストックが見つかりません' } },
        { status: 404 }
      );
    }

    // バリデーション
    const updateStockSchema = z.object({
      productName: z.string().min(1).max(255).optional(),
      productType: z.enum(['raw_material', 'intermediate', 'final_dish', 'seasoning', 'other']).optional(),
      status: z.enum(['AVAILABLE', 'NEED_REFILL', 'NO_REFILL']).optional(),
      quantityMemo: z.string().optional(),
      stateMemo: z.string().optional(),
      stockedSinceDate: z.string().date().optional(),
    });

    const validated = updateStockSchema.parse(body);

    // 製品情報が変更された場合は製品を更新
    if (validated.productName || validated.productType) {
      const productName = validated.productName || existingStock.productName;
      const productType = validated.productType || existingStock.productType;

      // 製品を取得または作成
      let product = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.name, productName),
            eq(products.type, productType)
          )
        )
        .limit(1);

      let productId: string;
      if (product.length === 0) {
        const [newProduct] = await db
          .insert(products)
          .values({
            name: productName,
            type: productType,
            isStockable: productType !== 'seasoning',
          })
          .returning();
        productId = newProduct.id;
      } else {
        productId = product[0].id;
      }

      // ストックを更新
      await db
        .update(stocks)
        .set({
          productId,
          productName,
          productType,
          status: validated.status || existingStock.status,
          quantityMemo: validated.quantityMemo !== undefined ? validated.quantityMemo : existingStock.quantityMemo,
          stateMemo: validated.stateMemo !== undefined ? validated.stateMemo : existingStock.stateMemo,
          stockedSinceDate: validated.stockedSinceDate || existingStock.stockedSinceDate,
        })
        .where(eq(stocks.stockId, stockId));
    } else {
      // 製品情報が変更されていない場合は通常の更新
      await db
        .update(stocks)
        .set({
          status: validated.status || existingStock.status,
          quantityMemo: validated.quantityMemo !== undefined ? validated.quantityMemo : existingStock.quantityMemo,
          stateMemo: validated.stateMemo !== undefined ? validated.stateMemo : existingStock.stateMemo,
          stockedSinceDate: validated.stockedSinceDate || existingStock.stockedSinceDate,
        })
        .where(eq(stocks.stockId, stockId));
    }

    return NextResponse.json({
      message: 'ストックを更新しました',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'バリデーションエラー',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}

// DELETE /api/stocks/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const stockId = params.id;

    // ストックの所有権を確認
    const [existingStock] = await db
      .select()
      .from(stocks)
      .where(
        and(
          eq(stocks.stockId, stockId),
          eq(stocks.userId, user.userId)
        )
      )
      .limit(1);

    if (!existingStock) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'ストックが見つかりません' } },
        { status: 404 }
      );
    }

    // ストックを削除
    await db.delete(stocks).where(eq(stocks.stockId, stockId));

    return NextResponse.json({
      message: 'ストックを削除しました',
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
