'use client'

import { useEffect, useState } from "react";
import DummyBoard from "../../../play/online/dummy_board";
import { game_broadcast_init_game_schema } from "@repo/types";
import { useSession } from "next-auth/react";
import { SignallingManager } from "@/lib/singleton/signal_manager";
import { MoveCallbackData } from "@/app/home/play/online/game/[game_id]/page";
import { useToast } from "@repo/ui";
import { ScrollArea } from "@repo/ui";
import { useRef } from "react";
import { StarFilledIcon } from "@radix-ui/react-icons";

export default function GameBroadCast({params}:{params: {game_id: string}}){
    const [fen,setFen] = useState<string>();
    const session = useSession();
    const { toast } = useToast();
    const moves_ref = useRef<HTMLDivElement>(null);
    const [moves,setMoves] = useState<string[]>();

    useEffect(()=>{
        async function fetch_board(){
            try{
                const resp = await fetch(`/api/game/${params.game_id}`);
                const {data : raw_data} = await resp.json();
                const data = game_broadcast_init_game_schema.parse(raw_data);
                setFen(data.currentState);
                const prev_moves = data.moves.map((m) => m.move);
                setMoves(prev_moves);
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
                    game_id: params.game_id,
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
                        game_id: params.game_id,
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
        <div className="flex lg:flex-row flex-col justify-between m-12 space-x-2 m-24">
            <DummyBoard fen={fen}/>
            <div className="w-[720px] m-2">
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
    )
}