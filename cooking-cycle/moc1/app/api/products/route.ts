import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { requireAuth } from '@/lib/auth';
import { eq, or, like, sql } from 'drizzle-orm';
import { z } from 'zod';

// GET /api/products
export async function GET(request: NextRequest) {
  try {
    await requireAuth(); // 認証チェックのみ
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const type = searchParams.get('type');
    const isStockable = searchParams.get('is_stockable');

    let query = db.select().from(products);

    const conditions = [];
    if (keyword) {
      conditions.push(like(products.name, `%${keyword}%`));
    }
    if (type) {
      conditions.push(eq(products.type, type as any));
    }
    if (isStockable !== null) {
      conditions.push(eq(products.isStockable, isStockable === 'true'));
    }

    if (conditions.length > 0) {
      query = query.where(or(...conditions));
    }

    const productsList = await query.limit(100);

    return NextResponse.json({
      products: productsList,
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

// POST /api/products
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();

    const createProductSchema = z.object({
      name: z.string().min(1).max(255),
      type: z.enum(['raw_material', 'intermediate', 'final_dish', 'seasoning', 'other']),
      isStockable: z.boolean().optional(),
    });

    const validated = createProductSchema.parse(body);

    const [newProduct] = await db
      .insert(products)
      .values({
        name: validated.name,
        type: validated.type,
        isStockable: validated.isStockable ?? (validated.type !== 'seasoning'),
      })
      .returning();

    return NextResponse.json({
      id: newProduct.id,
      message: '製品を登録しました',
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
