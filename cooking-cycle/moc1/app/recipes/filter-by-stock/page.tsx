import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { FilteredRecipeList } from '@/components/filtered-recipe-list';

export default async function FilterByStockPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-4xl font-bold mb-8">ストック優先で検索</h1>
        <FilteredRecipeList />
      </div>
    </div>
  );
}
