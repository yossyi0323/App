import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { StockList } from '@/components/stock-list';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function StocksPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">ストック一覧</h1>
          <Link href="/stocks/new">
            <Button>新規登録</Button>
          </Link>
        </div>
        <StockList />
      </div>
    </div>
  );
}
