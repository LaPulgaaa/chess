import type { NextAuthOptions, SessionStrategy } from "next-auth";
import { CallbacksOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import prisma from "@repo/prisma";

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
                if(!credentials)
                {
                    console.error("For some reason credentials are missing");
                    throw new Error("Something broke!")
                }

                const user = await prisma.user.findUnique({
                    where: {
                        username: credentials.email,
                    }
                });

                if(user === null){
                    throw new Error("User not found!!");
                }

                const password = await prisma.password.findUnique({
                    where: {
                        user_id: user.id,
                    }
                });

                if(password === null){
                    throw new Error("Can not verify password");
                }

                return {
                    ...user,
                    id: user.id
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
        async session(params: Parameters<CallbacksOptions["session"]>[0]){
            return {id: params.token.sub, ...params.session};
        }
    }
}
