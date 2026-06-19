import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Role } from '@prisma/client';
import {
  type DefaultSession,
  type NextAuthConfig,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from '~/lib/utils';

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      nim: string;
      faculty?: string;
      program?: string;
      role: Role;
      name: string;
      image?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    nim?: string;
    faculty?: string;
    program?: string;
    role?: Role;
    name?: string | null;
    image?: string | null;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "nim@mahasiswa.itb.ac.id",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, _) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Please enter your email and password.");
        }

        // 1. Find the user in your database by email
        const user = await db.user.findUnique({
          where: { email: (credentials.email as string).toLowerCase() }, // Ensure consistent casing
        });

        if (!user) {
          // If no user found, return null and NextAuth.js will display a generic error
          // For security, avoid revealing if it's an invalid email or password
          throw new Error("Invalid email or password.");
        }

        // 2. Verify the password
        const isValid = await verifyPassword(
          credentials.password as string,
          user.password,
        );

        if (!isValid) {
          throw new Error("Invalid email or password.");
        }

        // 3. Optional: Verify ITB student email domain
        if (!user.email.endsWith("@mahasiswa.itb.ac.id")) {
          // You can choose to allow non-ITB students or restrict here.
          // For ITB students only:
          throw new Error("Only ITB student emails are allowed.");
          // Or if you allow other emails but want to mark ITB students:
          // user.isITBStudent = true; // This would require updating the user in DB or passing through token
        }

        // Return user object if authentication is successful.
        // This object will be persisted to the JWT session.
        return {
          ...user,
          nim: user.nim ?? undefined,
          faculty: user.faculty ?? undefined,
          program: user.program ?? undefined,
          image: user.image,

        };
      },
    }),
  ],
  session: {
    strategy: "jwt", // CredentialsProvider requires JWT sessions
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // user object is available only on first login (from authorize)
        // Add custom properties from your user object to the token
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.nim = user.nim;
        token.faculty = user.faculty;
        token.program = user.program;
        token.role = user.role;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.user.id = token.id as string;
      session.user.email = token.email!;
      session.user.name = token.name!;
      session.user.nim = token.nim as string;
      session.user.faculty = token.faculty as string;
      session.user.program = token.program as string;
      session.user.role = token.role as Role;
      session.user.image = token.image as string;
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    signOut: "/auth/sign-out",
  }
} satisfies NextAuthConfig;
