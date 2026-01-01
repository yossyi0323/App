import { auth } from '@/app/api/auth/[...nextauth]/route';

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user || !(session.user as any).id) {
    throw new Error('Unauthorized');
  }
  return session.user as { id: string; email: string; name: string; image?: string };
}
