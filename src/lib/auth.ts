import NextAuth, { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { getUserByEmail, getUserById } from "@/lib/db"

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) throw new Error("Email and password are required")

        const email = credentials.email as string
        const password = credentials.password as string

        try {
          const user = await getUserByEmail(email);

          if (!user) throw new Error("No account found with this email")

          const passwordMatch = await bcrypt.compare(password, user.password)
          if (!passwordMatch) throw new Error("Invalid password")

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.avatar,
            role: user.role,
          }
        } catch (err) {
          throw err
        }
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Always find user by email to get the correct MongoDB _id
        if (user.email) {
          const dbUser = await getUserByEmail(user.email)
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role ?? "user"
          } else {
            token.id = user.id
            token.role = (user as { role?: string }).role ?? "user"
          }
        } 
      } else if (token.id) {
        const dbUser = await getUserById(token.id as string)
        token.role = dbUser?.role ?? "user"
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
