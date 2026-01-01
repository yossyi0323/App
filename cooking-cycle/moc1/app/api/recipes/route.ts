import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { recipes, recipeComponents, recipeOutputs, products } from '@/lib/schema';
import { requireAuth } from '@/lib/auth';
import { eq, and, desc, asc, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';

// バリデーションスキーマ（Phase 1）
const createRecipeSchema = z.object({
  name: z.string().min(1).max(255),
  recipeUrl: z.string().url().optional().or(z.literal('')),
  instructionsText: z.string().min(1),
  components: z.array(z.object({
    inputType: z.enum(['PRODUCT', 'TEXT_INPUT']),
    productId: z.string().uuid().optional(),
    ingredientName: z.string().optional(),
    quantityMemo: z.string().optional(),
    isOptional: z.boolean().optional(),
  })).min(1),
  outputs: z.array(z.object({
    productId: z.string().uuid(),
    quantityMemo: z.string().optional(),
    isMainOutput: z.boolean().optional(),
  })).min(1),
});

// GET /api/recipes
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    const offset = (page - 1) * limit;

    // 有効なレシピのみ取得（deleted_at IS NULL）
    const recipesList = await db
      .select({
        recipeId: recipes.recipeId,
        name: recipes.name,
        createdAt: recipes.createdAt,
        updatedAt: recipes.updatedAt,
      })
      .from(recipes)
      .where(
        and(
          eq(recipes.userId, user.userId),
          isNull(recipes.deletedAt)
        )
      )
      .orderBy(order === 'asc' ? asc(recipes[sort as keyof typeof recipes]) : desc(recipes[sort as keyof typeof recipes]))
      .limit(limit)
      .offset(offset);

    // 総件数を取得
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(recipes)
      .where(
        and(
          eq(recipes.userId, user.userId),
          isNull(recipes.deletedAt)
        )
      );

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      recipes: recipesList,
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

// POST /api/recipes
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // バリデーション
    const validated = createRecipeSchema.parse(body);

    // トランザクションでレシピと関連データを登録
    const result = await db.transaction(async (tx) => {
      // レシピを登録
      const [newRecipe] = await tx
        .insert(recipes)
        .values({
          userId: user.userId,
          name: validated.name,
          recipeUrl: validated.recipeUrl || null,
          instructionsText: validated.instructionsText,
        })
        .returning();

      // 材料を登録
      if (validated.components.length > 0) {
        await tx.insert(recipeComponents).values(
          validated.components.map((comp) => ({
            recipeId: newRecipe.recipeId,
            inputType: comp.inputType,
            productId: comp.productId || null,
            ingredientName: comp.ingredientName || null,
            quantityMemo: comp.quantityMemo || null,
            isOptional: comp.isOptional || false,
          }))
        );
      }

      // アウトプットを登録
      if (validated.outputs.length > 0) {
        await tx.insert(recipeOutputs).values(
          validated.outputs.map((output) => ({
            recipeId: newRecipe.recipeId,
            productId: output.productId,
            quantityMemo: output.quantityMemo || null,
            isMainOutput: output.isMainOutput !== false,
          }))
        );
      }

      return newRecipe;
    });

    return NextResponse.json({
      recipeId: result.recipeId,
      message: 'レシピを登録しました',
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
