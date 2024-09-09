'use client'
import Image from "next/image";
import Link from "next/link";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { redirect, useRouter } from "next/navigation";

import { signIn } from "next-auth/react";

import { Button } from "@repo/ui";

import GoogleIcon from "@/public/google.svg";

export default function Login(){
    const router = useRouter();

    return (
        <div className="overflow-hidden rounded-[0.5rem] border bg-background shadow mx-4 mt-8">
            <div className="flex-col items-center justify-center h-[800px] md:grid lg:grid-cols-2 lg:max-w-none lg:px-0">
            <div className="relative h-full hidden flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900"></div>
                <div className="relative z-20 flex items-center text-lg font-medium italic">
                    play/ Chess
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <div className="text-lg">
                        "Once you’re a chess player, you spend a lot of time thinking about the game and you can’t get it completely out of your head."
                        </div>
                        <footer className="text-sm italic">Magnus Carlsen</footer>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">Login to your account</h1>
                    </div>
                    <div className="grid gap-6">
                        <Button
                        className=""
                        onClick={async()=>{
                            
                        }}
                        >
                            <Image
                            src={GoogleIcon}
                            alt="google"
                            width={24}
                            height={24}
                            className="pr-[4px] mr-[4px]"
                            />
                            Google
                        </Button>
                    </div>
                    <div>
                        <Link href="/signup">Don't have an account?</Link>
                    </div>
                </div>
            </div>
            </div>
        </div>
    )
}