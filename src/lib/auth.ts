
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User"; // Ensure this path is correct
import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      id: "credentials", // This ID is used by signIn function
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[NextAuth Authorize] Received credentials:", { email: credentials?.email }); // Server-side log

        if (!credentials?.email || !credentials.password) {
          console.error("[NextAuth Authorize] Email or password missing");
          throw new Error("Email and password are required");
        }

        try {
          console.log("[NextAuth Authorize] Attempting DB connection...");
          await connectDB();
          console.log("[NextAuth Authorize] DB connected successfully.");
        } catch (dbError) {
          console.error("[NextAuth Authorize] DB connection error:", dbError);
          throw new Error("Database connection failed. Please try again later.");
        }
        
        let user;
        try {
          user = await User.findOne({
            email: credentials.email,
          }).select("+password"); // Explicitly select password for comparison
          console.log("[NextAuth Authorize] User found in DB:", user ? { id: user._id, email: user.email, name: user.name, role: user.role } : "No user found");
        } catch (findError) {
           console.error("[NextAuth Authorize] Error finding user:", findError);
           throw new Error("Error accessing user data. Please try again later.");
        }


        if (!user) {
          console.warn("[NextAuth Authorize] No user found with email:", credentials.email);
          throw new Error("Invalid credentials"); // Generic error for security
        }

        let passwordMatch = false;
        try {
            passwordMatch = await bcrypt.compare(
                credentials.password,
                user.password
            );
            console.log("[NextAuth Authorize] Password comparison result:", passwordMatch);
        } catch (bcryptError) {
            console.error("[NextAuth Authorize] bcrypt.compare error:", bcryptError);
            throw new Error("Error during password verification. Please try again later.");
        }


        if (!passwordMatch) {
          console.warn("[NextAuth Authorize] Password mismatch for user:", credentials.email);
          throw new Error("Invalid credentials"); // Generic error
        }
        
        console.log("[NextAuth Authorize] Credentials valid, returning user object.");
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role, // Add role to the user object
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET, 
  pages: {
    signIn: '/login', 
  },
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      // console.log("[NextAuth JWT Callback] Token:", token, "User:", user, "Account:", account);
      if (user) { // User object is only passed on initial sign-in
        token.id = user.id;
        token.name = user.name;
        token.email = user.email; // Ensure email is explicitly passed to token
        token.image = user.image;
        // @ts-ignore 
        token.role = user.role; 
      }
      return token;
    },
    async session({ session, token }) {
      // console.log("[NextAuth Session Callback] Session:", session, "Token:", token);
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email; // Ensure email is set from token
        session.user.image = token.image as string | null | undefined;
        session.user.role = token.role as string | null | undefined; 
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development', // Enable NextAuth debug logs in development
};
