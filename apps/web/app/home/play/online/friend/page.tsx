'use server'

import { HandshakeIcon, SearchIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage, Badge, Dialog, DialogContent, DialogTrigger, Input } from "@repo/ui";
import { get_friends } from "./actions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Search from "./search";
import DummyBoard from "../dummy_board";
import Profile from "./profile";

export default async function Friend(){
    const session = await getServerSession();
    if(session === null)
        redirect("/home");

    const friends = await get_friends(session.user?.email!);
    return (
        <div className="flex lg:flex-row flex-col justify-between m-12 space-x-2">
            <DummyBoard/>
            <div className="w-full flex flex-col items-center dark:bg-zinc-900 bg-orange-100 mt-4">
                <div className="flex space-x-2 justify-center mt-4">
                    <HandshakeIcon className="mt-2 mr-2"/>
                    <h3 className="text-2xl font-semibold tracking-tight">
                        Play a friend
                    </h3>
                </div>
                <Search/>
                <div className="w-full px-6 mt-4">
                    <div className="flex">
                        <p>Friends</p>
                        <Badge className="ml-1" variant={"secondary"}>{friends?.length ?? 0}</Badge>
                    </div>
                    <div className="space-y-2 mt-2 ml-2">
                        {friends && friends.map((friend)=>{
                            return (
                                <Dialog>
                                    <DialogTrigger>
                                        <div key={friend.email}
                                        className="flex space-x-2"
                                        >
                                            <Avatar className="rounded-none">
                                                <AvatarImage
                                                className="rounded-none"
                                                src = {friend.avatar ?? ""}
                                                />
                                                <AvatarFallback
                                                className="rounded-none"
                                                >{friend.username.substring(0,2)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex mt-2 justify-between space-x-2">
                                                <p>{friend.username}</p>
                                                <Badge className="mb-2">#{friend.rating}</Badge>
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <Profile {...friend}/>
                                    </DialogContent>
                                </Dialog>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}