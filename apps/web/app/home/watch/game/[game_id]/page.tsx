'use client'

import { z } from "zod";

import { useEffect, useState, useRef } from "react";
import { StarFilledIcon } from "@radix-ui/react-icons";
import DummyBoard from "../../../play/online/dummy_board";
import { game_broadcast_init_game_schema, player_data } from "@repo/types";
import { useSession } from "next-auth/react";
import { SignallingManager } from "@/lib/singleton/signal_manager";
import { MoveCallbackData } from "@/app/home/play/online/game/[game_id]/page";
import { useToast } from "@repo/ui";
import { ScrollArea } from "@repo/ui";

type PlayerData = z.output<typeof player_data>;
export default async function GameBroadCast({params}:{params: Promise<{game_id: string}>}){
    const [fen,setFen] = useState<string>();
    const session = useSession();
    const { toast } = useToast();
    const moves_ref = useRef<HTMLDivElement>(null);
    const [moves,setMoves] = useState<string[]>();
    const [white,setWhite] = useState<PlayerData>();
    const [black,setBlack] = useState<PlayerData>();
    const game_id = (await params).game_id

    useEffect(()=>{
        async function fetch_board(){
            try{
                const resp = await fetch(`/api/game/${game_id}`);
                const {data : raw_data} = await resp.json();
                const data = game_broadcast_init_game_schema.parse(raw_data);
                setFen(data.currentState);
                const prev_moves = data.moves.map((m) => m.move);
                setMoves(prev_moves);

                data.players.forEach((player) => {
                    if(player.color === "b"){
                        setBlack(player);
                    }
                    else if(player.color === "w"){
                        setWhite(player);
                    }
                })
            }catch(err){
                console.log(err);
            }
        }
        fetch_board();
    },[]);

    function move_callback(raw_data:string){
        const data:(MoveCallbackData & { updated_fen: string }) = JSON.parse(raw_data);
        setFen(data.updated_fen);
        setMoves((old_moves) => [...old_moves ?? [],data.to]);

        if(data.is_game_over){
            if(data.is_checkmate === true){
                toast({
                    title: "Checkmate",
                    description: `${data.winner.color} won!!`
                })
            }
    
            if(data.is_draw === true){
                toast({
                    title: "Draw",
                    description: `Game over. It's a draw`
                })
            }
        }
    }

    useEffect(()=>{
        if(session.status === "authenticated"){
            //@ts-ignore
            const username = session.data.username;
            const message = JSON.stringify({
                type: "STREAM_GAME",
                payload: {
                    game_id: game_id,
                    user_id: username,
                }
            });
            SignallingManager.get_instance(username).HANDLE_MESSAGE(message);
            SignallingManager.get_instance().REGISTER_CALLBACK("STREAM_GAME",move_callback)
        }

        return () => {
            if(session.status === "authenticated"){
                //@ts-ignore
                const username = session.data.username;
                const message = JSON.stringify({
                    type: "STOP_STREAM",
                    payload: {
                        game_id: game_id,
                        user_id: username,
                    }
                });
                SignallingManager.get_instance(username).HANDLE_MESSAGE(message);
                SignallingManager.get_instance().DEREGISTER_CALLBACK("STREAM_GAME");
            }
        }
    },[session.status]);

    useEffect(()=>{
        const move_node = moves_ref.current;
        if(move_node !== null){
            const move_divs = move_node.querySelectorAll("#moves");
            if(move_divs.length<1)
                return ;

            const last_move_div_idx = move_divs.length-1;
            move_divs[last_move_div_idx]?.scrollIntoView({
                inline: "end",
                behavior: "smooth"
            })
        }
    },[moves]);
    return(
        <div className="m-12 mx-24">
            <div className="flex lg:flex-row flex-col justify-between space-x-2">
                <div>
                <div className="dark:bg-zinc-800 md:w-[800px] w-[640px] p-4">
                    {
                        black && <p className="text-muted-foreground">{black.user.username}<span className="mt-1"> #{black.user.rating}</span></p>
                    }
                </div>
                {fen && <DummyBoard fen={fen}/>}
                <div className="dark:bg-zinc-800 md:w-[800px] w-[640px] p-4">
                    {
                        white && <p className="text-muted-foreground">{white.user.username}<span className=" mt-1"> #{white.user.rating}</span></p>
                    }
                </div>
                </div>
                <div className="w-1/2">
                    <div className="flex items-center dark:bg-zinc-800 p-2 py-3">
                        <StarFilledIcon className="mx-2"/>
                        <h3 className="scroll-m-20 font-semibold tracking-tight">
                            Moves Played
                        </h3>
                    </div>
                    <ScrollArea className="md:h-[800px] h-[640px]">
                    { 
                            moves && <div 
                                ref={moves_ref}
                                className="grid grid-cols-2">
                                {
                                    moves.map((move,i) => {
                                        return(
                                            <div
                                            key={i}
                                            id="moves"
                                            className={`p-2 my-1 ${i%2 == 0 ? "dark:bg-zinc-700" : "dark:bg-zinc-800"}`}>
                                                {move}
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        }
                    </ScrollArea>
                </div>
            </div>
        </div>
    )
}