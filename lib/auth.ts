import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  ...authConfig,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // Expire session after 24 hours of inactivity
    updateAge: 60 * 60, // Rotate JWT every hour for security
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        await dbConnect();
        
        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await User.findOne({ email });
        if (!user) return null;
        
        // If user is Google-only, they won't have a password hash
        if (!user.passwordHash) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            email: user.email,
            name: user.name,
            image: user.image,
            provider: "google",
            completedOnboarding: false, // new google users need onboarding
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      try {
        if (user) {
          await dbConnect();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role || "user";
            token.completedOnboarding = dbUser.completedOnboarding ?? true;
          } else if (account?.provider === "credentials") {
            // This should rarely happen as authorize already checked
            token.id = user.id;
          }
        }
        return token;
      } catch (error) {
        console.error("JWT Callback Error:", error);
        return token;
      }
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.completedOnboarding = (token.completedOnboarding as boolean) ?? true;
      }
      return session;
    },
  },
});
