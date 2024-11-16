'use client'

import { UserSearchIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage, Badge, Dialog, DialogContent, DialogTrigger, Input } from "@repo/ui";
import { Suspense, useEffect, useState } from "react";
import { search_users_by_creds } from "./actions";
import Profile from "./profile";
import { useSession } from "next-auth/react";
import RecievedChallenge from "@/app/home/recieved_challenges";

type Result = {
    username: string;
    name: string | null;
    rating: number;
    email: string;
    avatar: string | null;
    createdAt: Date;
};

export default function Search(){
    const [creds,setCreds] = useState<string>("");
    const [results, setResults] = useState<Result[]>([]);
    const session = useSession();

    useEffect(()=>{
        if(session.status === "authenticated" && creds.length > 3){
            const find_users = async() => {
                //@ts-ignore
                const users = await search_users_by_creds(creds, session.data.user?.email!, session.data.username);
                setResults(users);
            }

            find_users();
        }
        else{
            setResults([]);
        }
    },[creds])
    return (
        <div className="w-full mx-4">
            <div className="flex m-4 rounded-md border-2">
                <UserSearchIcon className="m-2"/>
                <Input
                onChange={(e)=>setCreds(e.target.value)}
                placeholder="Search by username or email"
                />
            </div>
            <div className="mx-4">
                {
                    results && results.map((result)=>{
                        return (
                            <Dialog key={result.username}>
                                <DialogTrigger asChild>
                                <div 
                                className="flex space-x-4 p-2 m-2 cursor-pointer"
                                >
                                    <Avatar
                                    className="rounded-none"
                                    >
                                        <AvatarImage
                                        className="rounded-none"
                                        src = {result.avatar ?? ""}/>
                                        <AvatarFallback
                                        className="rounded-none"
                                        >{result.username.substring(0,2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex mt-2 justify-between space-x-2">
                                        <p>{result.username}</p>
                                        <Badge className="mb-2">#{result.rating}</Badge>
                                    </div>
                                </div>
                                </DialogTrigger>
                                <DialogContent className="dark:bg-zinc-900 bg-orange-100">
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <Profile {
                                            ...result
                                        }/>
                                    </Suspense>
                                </DialogContent>
                            </Dialog>
                        )
                    })
                }
            </div>
            {session.status === "authenticated" && <RecievedChallenge/>}
        </div>
    )
}