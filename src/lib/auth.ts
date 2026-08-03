import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          // Dummy compare to prevent timing attacks
          await bcrypt.compare(credentials.password, "$2a$10$dummyHash123456789012345678901234567890")
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          guide_completed: user.guide_completed,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          })
          if (!dbUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                password_hash: "google_oauth",
              },
            })
          }
        } catch (error) {
          console.error("Error saving Google user:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        if (session?.guide_completed !== undefined) {
          token.guide_completed = session.guide_completed
        } else if (token.email) {
          try {
            const dbUser = await prisma.user.findUnique({ where: { email: token.email } })
            if (dbUser) {
              token.guide_completed = dbUser.guide_completed
            }
          } catch (e) {}
        }
      }
      
      if (user) {
        token.id = user.id
        token.guide_completed = (user as any).guide_completed
      }
      
      // If we don't have guide_completed in token yet (e.g. from Google Auth or first load),
      // we should fetch it from DB just once if possible, or assume false for now.
      // But since user is only present on first signin, let's just make sure it's set.
      if (token.guide_completed === undefined && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { email: token.email } })
          if (dbUser) {
            token.guide_completed = dbUser.guide_completed
          }
        } catch (e) {}
      }

      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id
        ;(session.user as any).guide_completed = token.guide_completed
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}
