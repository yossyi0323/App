'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';

interface Component {
  componentId: string;
  inputType: string;
  productId?: string;
  ingredientName?: string;
  quantityMemo?: string;
  isOptional: boolean;
  product?: {
    id: string;
    name: string;
    type: string;
  };
}

interface Output {
  outputId: string;
  productId: string;
  quantityMemo?: string;
  isMainOutput: boolean;
  product: {
    id: string;
    name: string;
    type: string;
  };
}

interface Recipe {
  recipeId: string;
  name: string;
  recipeUrl?: string;
  instructionsText: string;
  components: Component[];
  outputs: Output[];
  usedInRecipes: Array<{
    recipeId: string;
    name: string;
  }>;
}

interface RecipeDetailProps {
  recipeId: string;
}

export function RecipeDetail({ recipeId }: RecipeDetailProps) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRecipe();
  }, [recipeId]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recipes/${recipeId}`);
      if (!response.ok) throw new Error('Failed to fetch recipe');
      const data = await response.json();
      setRecipe(data.recipe);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      toast.error('レシピの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '削除に失敗しました');
      }

      toast.success('レシピを削除しました');
      router.push('/recipes');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'エラーが発生しました');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{recipe.name}</h1>
          <div className="flex gap-2">
            <Link href={`/recipes/${recipeId}/edit`}>
              <Button variant="outline">編集</Button>
            </Link>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              削除
            </Button>
          </div>
        </div>

        {recipe.recipeUrl && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <a
                href={recipe.recipeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                YouTube動画を見る
                <ExternalLink className="h-4 w-4" />
              </a>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>材料</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recipe.components.map((component, index) => (
                <li key={component.componentId} className="flex items-center gap-2">
                  <span>{index + 1}.</span>
                  <span>
                    {component.inputType === 'PRODUCT' && component.product
                      ? component.product.name
                      : component.ingredientName}
                  </span>
                  {component.quantityMemo && (
                    <span className="text-muted-foreground">({component.quantityMemo})</span>
                  )}
                  {component.isOptional && (
                    <Badge variant="outline">オプション</Badge>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>手順</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-sans">{recipe.instructionsText}</pre>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>アウトプット</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recipe.outputs.map((output) => (
                <li key={output.outputId} className="flex items-center gap-2">
                  <span>{output.product.name}</span>
                  {output.quantityMemo && (
                    <span className="text-muted-foreground">({output.quantityMemo})</span>
                  )}
                  {output.isMainOutput && (
                    <Badge variant="default">主なアウトプット</Badge>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {recipe.usedInRecipes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>このレシピを使うレシピ</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recipe.usedInRecipes.map((usedRecipe) => (
                  <li key={usedRecipe.recipeId}>
                    <Link
                      href={`/recipes/${usedRecipe.recipeId}`}
                      className="text-primary hover:underline"
                    >
                      {usedRecipe.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>レシピを削除しますか？</DialogTitle>
              <DialogDescription>
                この操作は取り消せません。レシピが他のレシピやストックから参照されている場合は削除できません。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                キャンセル
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? '削除中...' : '削除'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
