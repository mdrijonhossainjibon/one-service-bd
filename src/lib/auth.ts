import NextAuth, { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { getUserByEmail, getUserById, createUserFromOAuth } from "@/lib/db"

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await getUserByEmail(email);
        if (!user) return null

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar,
          role: user.role,
        }
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      // Google OAuth — find or create user, save avatar
      if (account?.provider === "google" && profile?.email) {
        await createUserFromOAuth({
          name: (profile.name as string) ?? profile.email.split("@")[0],
          email: profile.email,
          image: (profile as { picture?: string }).picture,
        })
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        // Always find user by email to get the correct MongoDB _id
        if (user.email) {
          const dbUser = await getUserByEmail(user.email)
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role 
          } 
        } 
      } 
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as { role?: string }).role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
