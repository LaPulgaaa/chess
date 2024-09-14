import type { NextAuthOptions, SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@repo/prisma";
import { JWT } from "next-auth/jwt";

export const auth_options:NextAuthOptions = {
    providers:[
        CredentialsProvider({
            id: "credentials",
            name: "play/Chess",
            type: "credentials",
            credentials:{
                email: {label: "Email",type:"email",placeholder:"johndoe123@domain.com"},
                password: {label: "Password", type: "password", placeholder: "Your super secret password"}
            },
            async authorize(credentials){
                if(!credentials){
                    throw new Error("Credentials unavailable");
                }

                const existing_user = await prisma.user.findUnique({
                    where:{
                        email: credentials.email,
                    },
                    select:{
                        id: true,
                        email: true,
                        username: true,
                        name: true,
                        avatar: true,
                    }
                });

                if(!existing_user){
                    throw new Error("User not found");
                }

                const password = await prisma.password.findUnique({
                    where:{
                        user_id: existing_user.id,
                    },
                    select:{
                        hash: true,
                    }
                });

                if(credentials.password !== password?.hash)
                {
                    throw new Error("User not found");
                }

                return {
                    ...existing_user
                }
            }
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET || "sec4et",
    pages: {
        signIn: "/signin"
    },
    session: {
        strategy: "jwt" as SessionStrategy
    },
    callbacks: {
        async jwt({
            token,
            trigger,
            session,
            user,
            account
        }){
            if(trigger === "update"){
                return {
                    ...token,
                    email: session?.email ?? token.email,
                    username: session?.username ?? token.username,
                    name: session?.name ?? token.name,
                    avatar: session?.avatar ?? token.picture,
                } as JWT;
            }

            if(!account){
                return {
                    ...token,
                } as JWT;
            }

            if(account.type === "credentials"){
                return {
                    ...token,
                    email: user.email,
                    //@ts-ignore
                    username: user.username,
                    name: user.name,
                    avatar: user.image,
                } as JWT;
            }

            return token;
        },
        async session({session,token,}){
            return {
                ...session,
                ...token
            }
        }
    }
}
