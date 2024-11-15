'use client'

import Image from "next/image";

import { useSession } from "next-auth/react"

import wq from "@/public/wq.png";
import bq from "@/public/bq.png";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LiveGameState } from "@repo/types";

export default function LiveGames(){
    const session = useSession();
    const [live_games,setLiveGames] = useState<LiveGameState[]>();

    useEffect(()=>{
        const fetch_live_games = async() => {
            try{
                const resp = await fetch(`/api/player/live/`,{
                    cache: "no-store"
                });
                const {data}:{data:LiveGameState[]} = await resp.json();
                setLiveGames(data);
            }catch(err){
                console.log(err);
                return null;
            }
        }
        fetch_live_games();
    },[])

    return (
        <div className="p-4">
            <h4 className="mb-4 text-sm font-medium leading-none">Live Games</h4>
            {
                live_games ?  live_games.map((game)=>{
                    const piece_img = game.color === "b" ? wq : bq;
                    const plays_str = game.plays.slice(-7).join(",")
                    return (
                        <Link key={game.game_id} href={`/home/play/online/game/${game.game_id}`}>
                        <div
                        className="w-full my-2 flex space-x-4 justify-between p-2 rounded-md bg-zinc-300 dark:bg-zinc-800 p-5 rounded-sm">
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
                }) : <div>Loading ....</div>
            }
        </div>
    )
}