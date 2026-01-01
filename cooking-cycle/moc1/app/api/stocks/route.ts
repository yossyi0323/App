import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stocks, products, recipes } from '@/lib/schema';
import { requireAuth } from '@/lib/auth';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { z } from 'zod';

// バリデーションスキーマ（Phase 1）
const createStockSchema = z.object({
  productName: z.string().min(1).max(255),
  productType: z.enum(['raw_material', 'intermediate', 'final_dish', 'seasoning', 'other']),
  status: z.enum(['AVAILABLE', 'NEED_REFILL', 'NO_REFILL']),
  quantityMemo: z.string().optional(),
  stateMemo: z.string().optional(), // Phase 1で使用
  stockedSinceDate: z.string().date(),
  createdFromRecipeId: z.string().uuid().optional(),
});

// GET /api/stocks
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'stocked_since_date';
    const order = searchParams.get('order') || 'desc';
    const type = searchParams.get('type'); // フィルター: raw_material, intermediate, final_dish

    const offset = (page - 1) * limit;

    let query = db
      .select({
        stockId: stocks.stockId,
        productId: stocks.productId,
        productName: stocks.productName,
        productType: stocks.productType,
        status: stocks.status,
        quantityMemo: stocks.quantityMemo,
        stateMemo: stocks.stateMemo,
        stockedSinceDate: stocks.stockedSinceDate,
        createdAt: stocks.createdAt,
        updatedAt: stocks.updatedAt,
      })
      .from(stocks)
      .where(eq(stocks.userId, user.userId));

    // 種類でフィルター
    if (type) {
      query = query.where(and(eq(stocks.userId, user.userId), eq(stocks.productType, type as any)));
    }

    const stocksList = await query
      .orderBy(order === 'asc' ? asc(stocks[sort as keyof typeof stocks]) : desc(stocks[sort as keyof typeof stocks]))
      .limit(limit)
      .offset(offset);

    // 総件数を取得
    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(stocks)
      .where(eq(stocks.userId, user.userId));

    if (type) {
      countQuery = countQuery.where(and(eq(stocks.userId, user.userId), eq(stocks.productType, type as any)));
    }

    const totalResult = await countQuery;
    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      stocks: stocksList,
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

// POST /api/stocks
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // バリデーション
    const validated = createStockSchema.parse(body);

    // 製品を取得または作成
    let product = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.name, validated.productName),
          eq(products.type, validated.productType)
        )
      )
      .limit(1);

    let productId: string;
    if (product.length === 0) {
      // 製品が存在しない場合は作成
      const [newProduct] = await db
        .insert(products)
        .values({
          name: validated.productName,
          type: validated.productType,
          isStockable: validated.productType !== 'seasoning',
        })
        .returning();
      productId = newProduct.id;
    } else {
      productId = product[0].id;
    }

    // ストックを登録
    const [newStock] = await db
      .insert(stocks)
      .values({
        userId: user.userId,
        productId,
        productName: validated.productName,
        productType: validated.productType,
        status: validated.status,
        quantityMemo: validated.quantityMemo || null,
        stateMemo: validated.stateMemo || null,
        stockedSinceDate: validated.stockedSinceDate,
        createdFromRecipeId: validated.createdFromRecipeId || null,
      })
      .returning();

    return NextResponse.json({
      stockId: newStock.stockId,
      message: 'ストックを登録しました',
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
