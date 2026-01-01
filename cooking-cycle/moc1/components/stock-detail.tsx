'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Stock {
  stockId: string;
  productName: string;
  productType: string;
  status: string;
  quantityMemo?: string;
  stateMemo?: string;
  stockedSinceDate: string;
  createdFromRecipeId?: string;
  usedInRecipes: Array<{
    recipeId: string;
    name: string;
  }>;
}

interface StockDetailProps {
  stockId: string;
}

const productTypeLabels: Record<string, string> = {
  raw_material: '食材',
  intermediate: '中間成果物',
  final_dish: '完成品',
  seasoning: '調味料',
  other: 'その他',
};

export function StockDetail({ stockId }: StockDetailProps) {
  const router = useRouter();
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStock();
  }, [stockId]);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stocks/${stockId}`);
      if (!response.ok) throw new Error('Failed to fetch stock');
      const data = await response.json();
      setStock(data.stock);
    } catch (error) {
      console.error('Error fetching stock:', error);
      toast.error('ストックの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/stocks/${stockId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '削除に失敗しました');
      }

      toast.success('ストックを削除しました');
      router.push('/stocks');
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

  if (!stock) {
    return <div>ストックが見つかりません</div>;
  }

  const daysSince = differenceInDays(new Date(), new Date(stock.stockedSinceDate));
  const needsAlert = daysSince >= 30;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{stock.productName}</h1>
          <div className="flex gap-2">
            <Link href={`/stocks/${stockId}/edit`}>
              <Button variant="outline">編集</Button>
            </Link>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              削除
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>ストック情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="font-medium">種類: </span>
              <Badge variant="outline">{productTypeLabels[stock.productType] || stock.productType}</Badge>
            </div>
            {stock.stateMemo && (
              <div>
                <span className="font-medium">状態: </span>
                <span>{stock.stateMemo}</span>
              </div>
            )}
            {stock.quantityMemo && (
              <div>
                <span className="font-medium">量: </span>
                <span>{stock.quantityMemo}</span>
              </div>
            )}
            <div>
              <span className="font-medium">冷凍開始日: </span>
              <span>{format(new Date(stock.stockedSinceDate), 'yyyy年MM月dd日', { locale: ja })}</span>
            </div>
            {needsAlert && (
              <div>
                <Badge variant="destructive">消費推奨（{daysSince}日経過）</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {stock.usedInRecipes.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>このストックを使うレシピ</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {stock.usedInRecipes.map((recipe) => (
                  <li key={recipe.recipeId}>
                    <Link
                      href={`/recipes/${recipe.recipeId}`}
                      className="text-primary hover:underline"
                    >
                      {recipe.name}
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
              <DialogTitle>ストックを削除しますか？</DialogTitle>
              <DialogDescription>
                この操作は取り消せません。
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
