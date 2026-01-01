import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import pool from '@/lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          // ユーザーが存在するか確認
          const userResult = await pool.query(
            'SELECT user_id FROM users WHERE email = $1',
            [user.email]
          );

          if (userResult.rows.length === 0) {
            // 新規ユーザーを作成
            await pool.query(
              `INSERT INTO users (user_id, email, name, picture_url)
               VALUES (uuid_generate_v4(), $1, $2, $3)`,
              [user.email, user.name || '', user.image || null]
            );
          } else {
            // 既存ユーザーの情報を更新
            await pool.query(
              `UPDATE users SET name = $1, picture_url = $2, updated_at = CURRENT_TIMESTAMP
               WHERE email = $3`,
              [user.name || '', user.image || null, user.email]
            );
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const userResult = await pool.query(
          'SELECT user_id, email, name, picture_url FROM users WHERE email = $1',
          [session.user.email]
        );
        if (userResult.rows.length > 0) {
          (session.user as any).id = userResult.rows[0].user_id;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});

export const { GET, POST } = handlers;
