'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { differenceInDays } from 'date-fns';

interface Stock {
  stockId: string;
  productName: string;
  productType: string;
  status: string;
  quantityMemo: string | null;
  stateMemo: string | null;
  stockedSinceDate: string;
  createdAt: string;
  updatedAt: string;
}

const productTypeLabels: Record<string, string> = {
  raw_material: '食材',
  intermediate: '中間成果物',
  final_dish: '完成品',
  seasoning: '調味料',
  other: 'その他',
};

export function StockList() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchStocks();
  }, [page]);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stocks?page=${page}&limit=20`);
      if (!response.ok) throw new Error('Failed to fetch stocks');
      const data = await response.json();
      setStocks(data.stocks);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (stocks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">ストックがありません</p>
        <Link href="/stocks/new">
          <Button>最初のストックを登録</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stocks.map((stock) => {
          const daysSince = differenceInDays(new Date(), new Date(stock.stockedSinceDate));
          const needsAlert = daysSince >= 30;

          return (
            <Card key={stock.stockId} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{stock.productName}</CardTitle>
                  <Badge variant="outline">{productTypeLabels[stock.productType] || stock.productType}</Badge>
                </div>
                <CardDescription>
                  {stock.stateMemo && <span className="block">状態: {stock.stateMemo}</span>}
                  {stock.quantityMemo && <span className="block">量: {stock.quantityMemo}</span>}
                  <span className="block">
                    冷凍開始: {format(new Date(stock.stockedSinceDate), 'yyyy年MM月dd日', { locale: ja })}
                  </span>
                  {needsAlert && (
                    <Badge variant="destructive" className="mt-2">消費推奨（{daysSince}日経過）</Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/stocks/${stock.stockId}`}>
                  <Button variant="outline" className="w-full">詳細を見る</Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
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
