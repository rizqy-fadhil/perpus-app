import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { authOptions } from "@/lib/auth";

const handler = NextAuth({
    providers: [
    CredentialsProvider({
        name: "credentials",
        credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
        const user = await prisma.user.findUnique({
            where: { email: credentials?.email },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(
            credentials!.password,
            user.password
        );
        if (!valid) return null;
        return {
            id: String(user.id),
            email: user.email,
            role: user.role,
        };
        },
    }),
],
callbacks: {
    async jwt({ token, user }) {
        if (user) token.role = (user as any).role;
        return token;
    },
    async session({ session, token }) {
        (session.user as any).role = token.role;
        return session;
    },
},
pages: {
    signIn: "/login",
},
session: {
    strategy: "jwt",
},
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };