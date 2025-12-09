import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

async function getUsers() {
	return await db.select().from(users)
  // .where(eq(users.email, "alice@example.com"))
}

export default async function Home() {
	const userList = await getUsers();

	return (
		<div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
				<div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
					<h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
						Drizzle ORM + Next.js Test
					</h1>
					<p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
						Databaseから取得したユーザー一覧を表示しています。
					</p>
				</div>

				<div className="w-full max-w-md">
					<h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">ユーザー一覧</h2>
					{userList.length === 0 ? (
						<p className="text-zinc-600 dark:text-zinc-400">
							データがありません。シードを実行してください。
						</p>
					) : (
						<ul className="space-y-2">
							{userList.map((user) => (
								<li
									key={user.id}
									className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900"
								>
									<div className="font-medium text-black dark:text-zinc-50">{user.name}</div>
									<div className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</div>
									<div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
										{user.createdAt?.toLocaleString("ja-JP")}
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			</main>
		</div>
	);
}
