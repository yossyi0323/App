'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Recipe {
  recipeId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchRecipes();
  }, [page]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recipes?page=${page}&limit=20`);
      if (!response.ok) throw new Error('Failed to fetch recipes');
      const data = await response.json();
      setRecipes(data.recipes);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">レシピがありません</p>
        <Link href="/recipes/new">
          <Button>最初のレシピを作成</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {recipes.map((recipe) => (
          <Card key={recipe.recipeId} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle>{recipe.name}</CardTitle>
              <CardDescription>
                作成: {format(new Date(recipe.createdAt), 'yyyy年MM月dd日', { locale: ja })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/recipes/${recipe.recipeId}`}>
                <Button variant="outline" className="w-full">詳細を見る</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            前へ
          </Button>
          <span className="flex items-center px-4">
            {page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  );
}
