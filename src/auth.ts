import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await prisma.user.findUnique({ where: { email } });

                    if (!user || !user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) return user;
                }

                console.log("Invalid credentials");
                return null;
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 15 * 60, // 15 minutes in seconds
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Initial sign in - populate token with user data
            if (user) {
                token.id = (user as any).id;
                token.role = (user as any).role;
                token.picture = (user as any).image;
                token.name = (user as any).name;
                token.email = (user as any).email;
            }

            // Handle session update - refresh data from database
            if (trigger === "update") {
                // Fetch fresh user data from database
                const freshUser = await prisma.user.findUnique({
                    where: { id: token.sub as string }
                });

                if (freshUser) {
                    token.name = freshUser.name;
                    token.picture = freshUser.image;
                    token.role = freshUser.role;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub as string;
                session.user.name = token.name as string;
                session.user.email = token.email as string;
                session.user.role = token.role as string;
                session.user.image = token.picture as string | null;
            }
            return session;
        }
    }
});

