'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Recipe {
  recipeId: string;
  name: string;
}

interface StockFormProps {
  initialData?: {
    stockId: string;
    productName: string;
    productType: string;
    status: string;
    quantityMemo?: string;
    stateMemo?: string;
    stockedSinceDate: string;
    createdFromRecipeId?: string;
  };
}

export function StockForm({ initialData }: StockFormProps) {
  const router = useRouter();
  const [productName, setProductName] = useState(initialData?.productName || '');
  const [productType, setProductType] = useState<string>(initialData?.productType || 'final_dish');
  const [status, setStatus] = useState<string>(initialData?.status || 'AVAILABLE');
  const [quantityMemo, setQuantityMemo] = useState(initialData?.quantityMemo || '');
  const [stateMemo, setStateMemo] = useState(initialData?.stateMemo || '');
  const [stockedSinceDate, setStockedSinceDate] = useState(
    initialData?.stockedSinceDate ? format(new Date(initialData.stockedSinceDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );
  const [createdFromRecipeId, setCreatedFromRecipeId] = useState(initialData?.createdFromRecipeId || '');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes?limit=100');
      if (!response.ok) throw new Error('Failed to fetch recipes');
      const data = await response.json();
      setRecipes(data.recipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData ? `/api/stocks/${initialData.stockId}` : '/api/stocks';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          productType,
          status,
          quantityMemo: quantityMemo || undefined,
          stateMemo: stateMemo || undefined,
          stockedSinceDate,
          createdFromRecipeId: createdFromRecipeId || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '保存に失敗しました');
      }

      toast.success(initialData ? 'ストックを更新しました' : 'ストックを登録しました');
      router.push('/stocks');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="productName">ストック名 *</Label>
            <Input
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>種類 *</Label>
            <RadioGroup value={productType} onValueChange={setProductType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="final_dish" id="final_dish" />
                <Label htmlFor="final_dish" className="font-normal">完成品</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="intermediate" />
                <Label htmlFor="intermediate" className="font-normal">中間成果物</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="raw_material" id="raw_material" />
                <Label htmlFor="raw_material" className="font-normal">食材</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="stateMemo">状態メモ（Phase 1）</Label>
            <Input
              id="stateMemo"
              value={stateMemo}
              onChange={(e) => setStateMemo(e.target.value)}
              placeholder="例: 水気なし、焼けた状態"
            />
          </div>
          <div>
            <Label htmlFor="quantityMemo">量・単位</Label>
            <Input
              id="quantityMemo"
              value={quantityMemo}
              onChange={(e) => setQuantityMemo(e.target.value)}
              placeholder="例: 2食分"
            />
          </div>
          <div>
            <Label htmlFor="stockedSinceDate">冷凍開始日 *</Label>
            <Input
              id="stockedSinceDate"
              type="date"
              value={stockedSinceDate}
              onChange={(e) => setStockedSinceDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="createdFromRecipeId">どのレシピから作られたか</Label>
            <Select value={createdFromRecipeId} onValueChange={setCreatedFromRecipeId}>
              <SelectTrigger>
                <SelectValue placeholder="レシピを選択（任意）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">なし</SelectItem>
                {recipes.map((recipe) => (
                  <SelectItem key={recipe.recipeId} value={recipe.recipeId}>
                    {recipe.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? '保存中...' : initialData ? '更新' : '登録'}
        </Button>
      </div>
    </form>
  );
}
