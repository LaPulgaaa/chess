'use server'

import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getServerSession } from "next-auth";
import { HistoryIcon, ListVideoIcon, Users } from "lucide-react";

import knight from "@/public/knight.png"
import { 
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    ScrollArea,
} from "@repo/ui";
import prisma from "@repo/prisma";

import { get_matches } from "./actions";
import LiveGames from "./live_games";
import Navbar from "@/components/navbar";
import GamesTable from "./games_table";
import SettingsDropdown from "./settings-dropdown";

async function get_details(email: string | null | undefined){
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
                fromFriendships: {
                    select: {
                        userTo: {
                            select: {
                                username: true,
                                avatar: true,
                            }
                        }
                    }
                },
                toFriendships: {
                    select: {
                        userFrom: {
                            select: {
                                username: true,
                                avatar: true,
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
    const my_matches = await get_matches(session.user.email!);

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
            detail: my_matches.filter((match) => match.status === "NOT_STARTED" || match.status === "IN_PROGRESS").length,
        }
    ]

    return(
        <div>
            <Navbar/>
            <div className="mx-36 my-12 space-y-12">
            <div className="flex justify-between">
                <div className="flex mx-8">
                    <Avatar>
                        <AvatarImage src={user_details.avatar ?? "https://avatar.varuncodes.com"} />
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
                    <SettingsDropdown/>
                </div>
            </div>
            <div className="hidden md:flex flex-col items-center lg:flex-row md:justify-center my-4 ">
                {
                    player_history.map((figure)=>{
                        return(
                            <div
                            key={figure.key}
                            className="flex flex-col border-[0.5px] p-6 w-[248px] dark:hover:bg-zinc-900 transition duration-300 ease-in-out">
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
            <div className="md:flex flex-col items-center lg:flex-row md:justify-center mt-12 md:space-x-24">
                <div className="flex flex-col space-y-4 mx-8 w-1/2">
                <Link href={"/home/play/online/random"} className="flex">
                    <Button
                    className="p-8 w-full" size={"lg"}>
                        <Image 
                        loading="lazy"
                        src={knight} alt="knight" style={{width:"24px"}}/>
                        <span className="ml-2">Play online</span>
                    </Button>
                </Link>
                <Link href={"/home/play/online/friend"} className="flex">
                    <Button className="p-8 w-full" size={"lg"}>
                        <Users/>
                        <span className="ml-2">Play a Friend</span>
                    </Button>
                </Link>
                <Link href={"/home/watch"} className="flex">
                    <Button className="p-8 w-full" size={"lg"}>
                        <ListVideoIcon/>
                        <span className="ml-2">Watch live</span>
                    </Button>
                </Link>
                </div>
                <div className="border-2 w-full lg:w-3/4 h-[300px] mt-4">
                    <ScrollArea className="flex flex-col item-center">
                            <LiveGames/>
                    </ScrollArea>
                </div>
            </div>
            <div>
                <GamesTable matches={my_matches}/>
            </div>
            </div>
        </div>
    )
}