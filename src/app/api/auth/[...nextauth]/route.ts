
import { authOptions } from "@/lib/auth"; // Adjust path if necessary
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
