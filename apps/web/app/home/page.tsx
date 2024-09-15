'use server'

import { redirect } from "next/navigation";
import Image from "next/image";

import prisma from "@repo/prisma";
import { getServerSession } from "next-auth";

import knight from "@/public/knight.png"
import { 
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput, CommandItem,
    CommandList,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger, 
    ScrollArea} from "@repo/ui";
import { HistoryIcon, ListVideoIcon, NetworkIcon, Users, Users2 } from "lucide-react";

export async function get_details(email: string | null | undefined){
    if(email === null || email === undefined)
        return null;
    try{
        const resp = await prisma.user.findUnique({
            where: {
                email,
            },
            select:{
                username: true,
                rating: true,
                player: {
                    select: {
                        result: true,
                    }
                },
                avatar: true,
                friends: {
                    select: {
                        user: {
                            select: {
                                avatar: true,
                                username: true,
                            }
                        }
                    }
                }
            }
        });

        return resp;
    }catch(err){
        console.log(err);
    }
}

type PlayerHistory = {
    key:number,
    title: string,
    icon: string,
    detail: number,
}[]

export default async function Home(){
    const session = await getServerSession();

    if(session === null || !session.user)
        redirect("/");

    const user_details = await get_details(session.user.email);

    if(user_details === null || user_details === undefined)
        redirect("/");

    const player_history:PlayerHistory = [
        {
            key: 0,
            title: "Matches Played",
            icon: "",
            detail: user_details.player.length
        },
        {
            key: 1,
            title: "Matches Won",
            icon: "",
            detail: user_details.player.filter((played)=> played.result === "WON").length
        },
        {
            key: 2,
            title: "Active Matches",
            icon: "",
            detail: 0
        }
    ]

    return(
        <div className="mx-48 my-12">
            <div className="flex justify-between">
                <div className="flex mx-8">
                    <Avatar>
                        <AvatarImage src={user_details.avatar ?? ""} />
                        <AvatarFallback>{user_details.username.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex mt-1 mx-2">
                        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mx-2">
                            {user_details.username}
                        </h4>
                        <p className="text-xl text-muted-foreground mx-2">
                            #{user_details.rating}
                        </p>
                    </div>
                </div>
                <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger><Users2/></DropdownMenuTrigger>
                        <DropdownMenuContent className="md:min-w-[400px]">
                        <Command className="rounded-lg border shadow-md md:min-w-[400px]">
                                <CommandInput placeholder="Search your friends..." />
                                <CommandList>
                                    <CommandEmpty>No results found.</CommandEmpty>
                                    <CommandGroup>
                                        {
                                            user_details.friends.map(({user})=>{
                                                return (
                                                    <CommandItem key={user.username}>
                                                        <Avatar>
                                                            <AvatarImage src={user.avatar ?? ""}/>
                                                            <AvatarFallback>{user.username.substring(0,2)}</AvatarFallback>
                                                        </Avatar>
                                                    </CommandItem>
                                                )
                                            })
                                        }
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="hidden md:flex justify-between my-4 ml-8">
                {
                    player_history.map((figure)=>{
                        return(
                            <div
                            key={figure.key}
                            className="flex flex-col mx-2 border-[0.5px] rounded-md p-6 w-1/5 hover:bg-zinc-900 transition duration-300 ease-in-out">
                                <div className="flex justify-between">
                                <small className="text-sm font-medium leading-none">{figure.title}</small>
                                <div className="text-muted-foreground pb-2"><HistoryIcon/></div>
                                </div>
                                <div className="flex justify-center text-center">
                                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-red-400">
                                    {figure.detail}
                                </h3>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            <div className="flex m-24">
                <div className="flex flex-col space-y-8">
                    <Button className="p-8" size={"lg"}>
                        <Image src={knight} alt="knight" style={{width:"24px"}}/>
                        <span className="ml-2">Play Online</span>
                    </Button>
                    <Button className="p-8" size={"lg"}>
                        <Users/>
                        <span className="ml-2">Play a Friend</span>
                    </Button>
                    <Button className="p-8" size={"lg"}>
                        <ListVideoIcon/>
                        <span className="ml-2">Watch live</span>
                    </Button>
                </div>
                <div>
                    <ScrollArea className="h-auto">

                    </ScrollArea>
                </div>
            </div>
        </div>
    )
}