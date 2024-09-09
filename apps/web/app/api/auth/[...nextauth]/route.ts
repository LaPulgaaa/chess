import { auth_options } from "@/lib/auth";
import NextAuth from "next-auth";

const handler = NextAuth(auth_options);

export {handler as GET, handler as POST};