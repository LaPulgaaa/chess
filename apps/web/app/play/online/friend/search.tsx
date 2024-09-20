'use client'

import { UserSearchIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage, Badge, Input } from "@repo/ui";
import { useEffect, useState } from "react";
import { search_users_by_creds } from "./actions";

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

    useEffect(()=>{
        if(creds.length > 3){
            const find_users = async() => {
                const users = await search_users_by_creds(creds);
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
                            <div 
                            className="flex space-x-4 p-2 m-2 cursor-pointer"
                            key={result.username}>
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
                        )
                    })
                }
            </div>
        </div>
    )
}