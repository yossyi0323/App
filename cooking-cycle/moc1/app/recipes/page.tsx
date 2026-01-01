import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { RecipeList } from '@/components/recipe-list';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function RecipesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">レシピ一覧</h1>
          <Link href="/recipes/new">
            <Button>新規登録</Button>
          </Link>
        </div>
        <RecipeList />
      </div>
    </div>
  );
}
