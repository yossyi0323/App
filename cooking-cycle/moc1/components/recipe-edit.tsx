'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeForm } from './recipe-form';

interface RecipeEditProps {
  recipeId: string;
}

export function RecipeEdit({ recipeId }: RecipeEditProps) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipe();
  }, [recipeId]);

  const fetchRecipe = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`);
      if (!response.ok) throw new Error('Failed to fetch recipe');
      const data = await response.json();
      setRecipe(data.recipe);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      router.push('/recipes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!recipe) {
    return <div>レシピが見つかりません</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">レシピ編集</h1>
        <RecipeForm
          initialData={{
            recipeId: recipe.recipeId,
            name: recipe.name,
            recipeUrl: recipe.recipeUrl || undefined,
            instructionsText: recipe.instructionsText,
            components: recipe.components.map((c: any) => ({
              inputType: c.inputType,
              productId: c.productId || undefined,
              ingredientName: c.ingredientName || undefined,
              quantityMemo: c.quantityMemo || undefined,
              isOptional: c.isOptional || false,
            })),
            outputs: recipe.outputs.map((o: any) => ({
              productId: o.productId,
              quantityMemo: o.quantityMemo || undefined,
              isMainOutput: o.isMainOutput !== false,
            })),
          }}
        />
      </div>
    </div>
  );
}
