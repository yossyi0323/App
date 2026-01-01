import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-4xl font-bold mb-8">料理サイクル</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>レシピ一覧</CardTitle>
              <CardDescription>登録したレシピを確認・管理</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/recipes">
                <Button className="w-full">レシピ一覧へ</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ストック一覧</CardTitle>
              <CardDescription>冷凍庫のストックを確認・管理</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/stocks">
                <Button className="w-full">ストック一覧へ</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ストック優先フィルター</CardTitle>
            <CardDescription>現在のストックから作れるレシピを表示</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/recipes/filter-by-stock">
              <Button className="w-full" variant="default">ストック優先で検索</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
