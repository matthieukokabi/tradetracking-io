import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("NEXTAUTH_SECRET must be set in production");
}

export const authOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // Credentials Provider (email/password)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          // Form data for OAuth2 spec compliance
          const formData = new URLSearchParams();
          formData.append("username", credentials.username);
          formData.append("password", credentials.password);

          const res = await fetch(`${API_URL}/api/v1/auth/token`, {
            method: "POST",
            body: formData,
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          });

          const data = await res.json();

          if (res.ok && data.access_token) {
            // Decode the backend JWT to get the real User ID (ObjectId)
            const decoded: any = jwtDecode(data.access_token);

            return {
              id: decoded.id || decoded.sub,
              name: decoded.sub,
              accessToken: data.access_token,
            };
          }
          return null;
        } catch (e) {
          console.error("Auth error", e);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      // Handle Google OAuth sign-in - create/link user in backend
      if (account?.provider === "google") {
        try {
          const res = await fetch(`${API_URL}/api/v1/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              google_id: account.providerAccountId,
              image: user.image,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            // Store the access token from our backend
            user.accessToken = data.access_token;
            user.id = data.user_id;
            return true;
          }
          return false;
        } catch (e) {
          console.error("Google auth error", e);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.provider = account?.provider || "credentials";
      }
      return token;
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      session.provider = token.provider;
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
