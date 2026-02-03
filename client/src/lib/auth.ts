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
        token.userId = user.id;
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
