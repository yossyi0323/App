'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StockForm } from './stock-form';

interface StockEditProps {
  stockId: string;
}

export function StockEdit({ stockId }: StockEditProps) {
  const router = useRouter();
  const [stock, setStock] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStock();
  }, [stockId]);

  const fetchStock = async () => {
    try {
      const response = await fetch(`/api/stocks/${stockId}`);
      if (!response.ok) throw new Error('Failed to fetch stock');
      const data = await response.json();
      setStock(data.stock);
    } catch (error) {
      console.error('Error fetching stock:', error);
      router.push('/stocks');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!stock) {
    return <div>ストックが見つかりません</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">ストック編集</h1>
        <StockForm
          initialData={{
            stockId: stock.stockId,
            productName: stock.productName,
            productType: stock.productType,
            status: stock.status,
            quantityMemo: stock.quantityMemo || undefined,
            stateMemo: stock.stateMemo || undefined,
            stockedSinceDate: stock.stockedSinceDate,
            createdFromRecipeId: stock.createdFromRecipeId || undefined,
          }}
        />
      </div>
    </div>
  );
}
