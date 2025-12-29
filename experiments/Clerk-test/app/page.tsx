import { SignedIn, SignedOut, UserProfile } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Clerk認証テストアプリ</h2>
        <p className="text-gray-600 mb-4">
          このアプリはClerkの認証機能を試すためのサンプルアプリケーションです。
        </p>
        
        <SignedOut>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="text-yellow-800">
              現在ログインしていません。ヘッダーのボタンからサインインまたはサインアップしてください。
            </p>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
            <p className="text-green-800">
              ログイン済みです！以下の機能を試すことができます。
            </p>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-xl font-semibold mb-3">ユーザープロフィール</h3>
              <div className="border rounded-lg p-4">
                <UserProfile routing="hash" />
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">利用可能な機能</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>サインイン / サインアップ</li>
                <li>ユーザープロフィール管理</li>
                <li>セキュリティ設定</li>
                <li>ソーシャルログイン（設定により利用可能）</li>
                <li>多要素認証（設定により利用可能）</li>
              </ul>
            </section>
          </div>
        </SignedIn>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">技術スタック</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>Next.js 15 (App Router)</li>
          <li>TypeScript</li>
          <li>Clerk (@clerk/nextjs)</li>
          <li>Tailwind CSS</li>
        </ul>
      </div>
    </div>
  );
}

