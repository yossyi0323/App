'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { toast } from 'sonner';

interface Recipe {
  recipe_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export default function SearchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }
    if (status === 'authenticated') {
      if (filter === 'stock') {
        fetchStockFilteredRecipes();
      } else {
        fetchRecipes();
      }
    }
  }, [status, router, filter]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recipes');
      if (!response.ok) throw new Error('Failed to fetch recipes');
      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast.error('レシピの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchStockFilteredRecipes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recipes/filter-by-stock');
      if (!response.ok) throw new Error('Failed to fetch recipes');
      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error('Error fetching stock-filtered recipes:', error);
      toast.error('レシピの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchRecipes();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/recipes?keyword=${encodeURIComponent(searchKeyword)}`);
      if (!response.ok) throw new Error('Failed to search recipes');
      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error('Error searching recipes:', error);
      toast.error('検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">読み込み中...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost">← 戻る</Button>
            </Link>
            <h1 className="text-3xl font-bold">検索</h1>
            <div className="w-20" />
          </div>

          <div className="flex gap-4">
            <Input
              placeholder="キーワード検索..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>検索</Button>
          </div>

          {filter === 'stock' && (
            <Card>
              <CardHeader>
                <CardTitle>ストック優先フィルター</CardTitle>
                <CardDescription>
                  現在のストックから作れるレシピを表示しています
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.recipe_id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle>{recipe.name}</CardTitle>
                  <CardDescription>
                    作成: {new Date(recipe.created_at).toLocaleDateString('ja-JP')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/recipes/${recipe.recipe_id}`}>
                    <Button variant="outline" className="w-full">詳細</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRecipes.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              {filter === 'stock'
                ? 'ストックから作れるレシピがありません'
                : searchKeyword
                ? '検索結果がありません'
                : 'レシピがありません'}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
