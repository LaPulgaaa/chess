'use server'

import { HandshakeIcon, SearchIcon } from "lucide-react";
import Board from "../board";
import { Avatar, AvatarFallback, AvatarImage, Badge, Input } from "@repo/ui";
import { get_friends } from "./actions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Search from "./search";

export default async function Friend(){
    const session = await getServerSession();
    if(session === null)
        redirect("/home");

    const friends = await get_friends(session.user?.email!);
    return (
        <div className="flex lg:flex-row flex-col justify-between m-12 space-x-2">
            <Board fen={""}/>
            <div className="w-full flex flex-col items-center dark:bg-zinc-900 bg-orange-100 mt-4">
                <div className="flex space-x-2 justify-center mt-4">
                    <HandshakeIcon className="mt-2 mr-2"/>
                    <h3 className="text-2xl font-semibold tracking-tight">
                        Play a friend
                    </h3>
                </div>
                <Search/>
                <div className="w-full m-4 flex flex-cols">
                    <div className="flex mx-6">
                        <p>Friends</p>
                        <Badge className="ml-1" variant={"secondary"}>{friends?.length ?? 0}</Badge>
                    </div>
                    <div>
                        {friends && friends.map((friend)=>{
                            return (
                                <div key={friend.email}
                                className="flex space-x-4"
                                >
                                    <Avatar>
                                        <AvatarImage
                                        src = {friend.avatar ?? ""}
                                        />
                                        <AvatarFallback>{friend.username.substring(0,2)}</AvatarFallback>
                                    </Avatar>
                                    <p className="mt-2">{friend.username}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}