
import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "placeholder",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "placeholder",
    }),
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        console.log('--- Authorize check for:', email);
        
        if (!email || !credentials?.password) {
          throw new Error("Credenciales incompletas");
        }

        const user = await prisma.user.findFirst({
          where: { 
            email: {
              equals: email
            }
          },
        });

        if (!user) {
          console.log('❌ User not found in DB for:', email);
          throw new Error("Usuario no encontrado");
        }
        
        if (!user.password) {
          console.log('❌ User exists but has no password set in DB');
          throw new Error("Su cuenta fue registrada mediante redes sociales (Google/Facebook). Inicie sesión con el mismo método o regístrese nuevamente para establecer una contraseña.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        console.log('--- Password comparison result:', isValid);
        
        if (!isValid) {
          console.log('❌ Invalid password for:', email);
          throw new Error("Contraseña incorrecta");
        }

        console.log('✅ Admin login success for:', email, 'Role:', user.role);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "any-random-string-for-dev",
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (user.email && account?.provider !== 'credentials') {
        try {
          await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name || "Usuario de Redes",
            },
            create: {
              email: user.email,
              name: user.name || "Usuario de Redes",
              role: "USER",
              status: "ACTIVE"
            }
          });
        } catch (error) {
          console.error("Error syncing user to DB:", error);
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
      }
      return session;
    },
  },
}
