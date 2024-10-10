'use client'

import Image from "next/image";

import { useSession } from "next-auth/react"
import { useRecoilValueLoadable } from "recoil"

import wq from "@/public/wq.png";
import bq from "@/public/bq.png";

import { live_games_store } from "@repo/store"
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LiveGames(){
    const session = useSession();
    const router = useRouter();
    //@ts-ignore
    const live_games = useRecoilValueLoadable(live_games_store({username: session.data?.username}));

    if(session.status !== "authenticated")
    {
        return (
            <div>Loading....</div>
        )
    }

    return (
        <div className="p-4">
            <h4 className="mb-4 text-sm font-medium leading-none">Live Games</h4>
            {
                live_games.state === "hasValue" && live_games.getValue()?.map((game)=>{
                    const piece_img = game.color === "b" ? wq : bq;
                    const plays_str = game.plays.slice(-7).join(",")
                    return (
                        <Link key={game.game_id} href={`/home/play/online/game/${game.game_id}`}>
                        <div
                        className="w-full flex space-x-4 justify-between p-2 rounded-md bg-zinc-800 p-5 rounded-sm">
                            <div className="flex space-x-2">
                                <div className="flex space-x-2">
                                    <Image 
                                    className="w-[32px]"
                                    src={piece_img} alt={game.color}/>
                                    <p className="mt-1">{game.opponent.username}</p>
                                    <p className="text-sm text-muted-foreground mt-2">#{game.opponent.rating}</p>
                                </div>
                            </div>
                            <div>
                                {
                                    plays_str.length > 0 ? <p className="text-muted-foreground">...{plays_str}</p> : <p className="mt-1 text-sm text-muted-foreground">No moves played yet.</p>
                                }
                            </div>
                        </div>
                        </Link>
                    )
                })
            }
        </div>
    )
}