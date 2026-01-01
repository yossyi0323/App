import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { recipes, recipeComponents, recipeOutputs, products } from '@/lib/schema';
import { requireAuth } from '@/lib/auth';
import { eq, and, isNull } from 'drizzle-orm';
import { z } from 'zod';

// GET /api/recipes/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const recipeId = params.id;

    // レシピを取得
    const [recipe] = await db
      .select()
      .from(recipes)
      .where(
        and(
          eq(recipes.recipeId, recipeId),
          eq(recipes.userId, user.userId),
          isNull(recipes.deletedAt)
        )
      )
      .limit(1);

    if (!recipe) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'レシピが見つかりません' } },
        { status: 404 }
      );
    }

    // 材料を取得
    const components = await db
      .select({
        componentId: recipeComponents.componentId,
        inputType: recipeComponents.inputType,
        productId: recipeComponents.productId,
        ingredientName: recipeComponents.ingredientName,
        quantityMemo: recipeComponents.quantityMemo,
        isOptional: recipeComponents.isOptional,
        product: {
          id: products.id,
          name: products.name,
          type: products.type,
        },
      })
      .from(recipeComponents)
      .leftJoin(products, eq(recipeComponents.productId, products.id))
      .where(eq(recipeComponents.recipeId, recipeId));

    // アウトプットを取得
    const outputs = await db
      .select({
        outputId: recipeOutputs.outputId,
        productId: recipeOutputs.productId,
        quantityMemo: recipeOutputs.quantityMemo,
        isMainOutput: recipeOutputs.isMainOutput,
        product: {
          id: products.id,
          name: products.name,
          type: products.type,
        },
      })
      .from(recipeOutputs)
      .leftJoin(products, eq(recipeOutputs.productId, products.id))
      .where(eq(recipeOutputs.recipeId, recipeId));

    // このストックを使うレシピを取得（RECIPE_COMPONENTSから逆引き）
    // 今回はレシピ詳細なので、このレシピのアウトプットを使うレシピを取得
    const usedInRecipes = await db
      .select({
        recipeId: recipes.recipeId,
        name: recipes.name,
      })
      .from(recipes)
      .innerJoin(recipeComponents, eq(recipes.recipeId, recipeComponents.recipeId))
      .innerJoin(recipeOutputs, eq(recipeComponents.productId, recipeOutputs.productId))
      .where(
        and(
          eq(recipeOutputs.recipeId, recipeId),
          eq(recipes.userId, user.userId),
          isNull(recipes.deletedAt)
        )
      )
      .groupBy(recipes.recipeId, recipes.name);

    return NextResponse.json({
      recipe: {
        ...recipe,
        components,
        outputs,
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

// PUT /api/recipes/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const recipeId = params.id;
    const body = await request.json();

    // レシピの所有権を確認
    const [existingRecipe] = await db
      .select()
      .from(recipes)
      .where(
        and(
          eq(recipes.recipeId, recipeId),
          eq(recipes.userId, user.userId),
          isNull(recipes.deletedAt)
        )
      )
      .limit(1);

    if (!existingRecipe) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'レシピが見つかりません' } },
        { status: 404 }
      );
    }

    // バリデーション（createRecipeSchemaと同じ）
    const updateRecipeSchema = z.object({
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

    const validated = updateRecipeSchema.parse(body);

    // トランザクションで更新
    await db.transaction(async (tx) => {
      // レシピを更新
      await tx
        .update(recipes)
        .set({
          name: validated.name,
          recipeUrl: validated.recipeUrl || null,
          instructionsText: validated.instructionsText,
        })
        .where(eq(recipes.recipeId, recipeId));

      // 既存の材料とアウトプットを削除
      await tx.delete(recipeComponents).where(eq(recipeComponents.recipeId, recipeId));
      await tx.delete(recipeOutputs).where(eq(recipeOutputs.recipeId, recipeId));

      // 新しい材料とアウトプットを登録
      if (validated.components.length > 0) {
        await tx.insert(recipeComponents).values(
          validated.components.map((comp) => ({
            recipeId,
            inputType: comp.inputType,
            productId: comp.productId || null,
            ingredientName: comp.ingredientName || null,
            quantityMemo: comp.quantityMemo || null,
            isOptional: comp.isOptional || false,
          }))
        );
      }

      if (validated.outputs.length > 0) {
        await tx.insert(recipeOutputs).values(
          validated.outputs.map((output) => ({
            recipeId,
            productId: output.productId,
            quantityMemo: output.quantityMemo || null,
            isMainOutput: output.isMainOutput !== false,
          }))
        );
      }
    });

    return NextResponse.json({
      message: 'レシピを更新しました',
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

// DELETE /api/recipes/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const recipeId = params.id;

    // レシピの所有権を確認
    const [existingRecipe] = await db
      .select()
      .from(recipes)
      .where(
        and(
          eq(recipes.recipeId, recipeId),
          eq(recipes.userId, user.userId),
          isNull(recipes.deletedAt)
        )
      )
      .limit(1);

    if (!existingRecipe) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'レシピが見つかりません' } },
        { status: 404 }
      );
    }

    // 依存関係をチェック（Phase 1では簡易的に実装）
    // 他のレシピの材料として参照されているか
    const [usedAsComponent] = await db
      .select()
      .from(recipeComponents)
      .innerJoin(recipeOutputs, eq(recipeComponents.productId, recipeOutputs.productId))
      .where(eq(recipeOutputs.recipeId, recipeId))
      .limit(1);

    // アレンジレシピの親レシピとして参照されているか
    const [usedAsParent] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.parentRecipeId, recipeId))
      .limit(1);

    // ストックの作成元として参照されているか
    const [usedInStocks] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.recipeId, recipeId))
      .limit(1);

    if (usedAsComponent || usedAsParent || usedInStocks) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'このレシピは他のレシピやストックから参照されているため削除できません',
          },
        },
        { status: 403 }
      );
    }

    // 論理削除（deleted_atを設定）
    await db
      .update(recipes)
      .set({ deletedAt: new Date() })
      .where(eq(recipes.recipeId, recipeId));

    return NextResponse.json({
      message: 'レシピを削除しました',
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
