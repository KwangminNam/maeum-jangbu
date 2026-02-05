import NextAuth from "next-auth";
import Kakao from "next-auth/providers/kakao";
import { SignJWT } from "jose";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        // 카카오는 이메일 동의 안하면 email이 없음 - providerAccountId로 대체
        const userEmail = user.email || `kakao_${account.providerAccountId}@placeholder.local`;

        // DB에 유저 생성/조회 후 DB의 user ID를 토큰에 저장
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/sync`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: userEmail,
                name: user.name,
                image: user.image,
              }),
            }
          );
          if (res.ok) {
            const dbUser = await res.json();
            token.userId = dbUser.id; // DB의 UUID 사용
          } else {
            console.error("Failed to sync user:", await res.text());
            token.userId = user.id; // fallback
          }
        } catch (error) {
          console.error("Failed to sync user:", error);
          token.userId = user.id; // fallback
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      // NestJS 서버로 보낼 JWT 생성 (jose 사용 - Edge 호환)
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
      session.accessToken = await new SignJWT({
        sub: token.userId as string,
        email: token.email,
        name: token.name,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(secret);
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
