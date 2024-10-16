'use client'

import { FlipVertical } from "lucide-react";

import { get_game_from_id } from "@repo/store";
import { Button, ScrollArea } from "@repo/ui";
import Board from "../../board";
import type { Square, PieceSymbol, Color} from "chess.js"
import { useSession } from "next-auth/react";
import { useRecoilValueLoadable } from "recoil";
import { useEffect, useRef, useState } from "react";
import { SignallingManager } from "@/lib/singleton/signal_manager";
import { GameManager } from "@/lib/singleton/game_manager";
import { StarFilledIcon } from "@radix-ui/react-icons";

type MoveCallbackData = {
    from: string,
    to: string,
    color: "w" | "b",
    promotion?: string,
    is_game_over: boolean,
    is_checkmate: boolean,
    is_draw: boolean,
}

type Board = ({
    square: Square;
    type: PieceSymbol;
    color: Color;
} | null)[][];

export default function Game({params}:{params: {game_id: string}}){
    const game_id = params.game_id;
    const session = useSession();
    const game_state = useRecoilValueLoadable(get_game_from_id({game_id}));
    const [board,setBoard] = useState<Board | undefined>(undefined);
    const [orient,setOrient] = useState<"w" | "b">("w");
    const [moves,setMoves] = useState<string[]>([]);
    const moves_ref = useRef<HTMLDivElement>(null);

    function move_callback(raw_data:string){
        const data:MoveCallbackData = JSON.parse(raw_data);
        setMoves((moves) => [...moves,data.to]);
        let updated_state = GameManager.get_instance().make_move(game_id,data.from,data.to,data.promotion);
        setBoard(updated_state)
    }

    function send_move(from: string,to: string, promotion?: string){
        const message = JSON.stringify({
            type: 'MOVE',
            payload: {
                game_id,
                player: {
                    player_id: game_state.getValue()?.player_id,
                    color: game_state.getValue()?.color
                },
                from,
                to,
                prev_fen: GameManager.get_instance().get_game_fen(game_id),
                promotion
            }
        })
        SignallingManager.get_instance().MOVE(message);
    }

    useEffect(()=>{
        if(session.status === "authenticated"){
            SignallingManager.get_instance().REGISTER_CALLBACK("MOVE",move_callback);
        }
        return () => {
            if(session.status === "authenticated"){
                SignallingManager.get_instance().DEREGISTER_CALLBACK("MOVE");
            }
        }
    },[session.status]);

    useEffect(()=>{
        if(game_state.state === "hasValue" && game_state.getValue()?.fen){
            const board = GameManager.get_instance().add_game(game_id, game_state.getValue()!.fen);
            setBoard(board);
            setOrient(game_state.getValue()!.color);
            setMoves(game_state.getValue()!.plays);
        }
    },[game_state.state, game_state.getValue()]);

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


    return (
        <div>
            {
                session.status === "authenticated" && game_state.state === "hasValue" && game_state.getValue() !== null && board ? 
                <div className="flex lg:flex-row flex-col justify-between mx-12 md:mx-24 my-6 space-x-2">
                    <div className={`flex ${orient === "w" ? "flex-col" : "flex-col-reverse"} mt-2`}>
                        <div className="dark:bg-zinc-800 md:w-[800px] w-[640px] p-4">
                            {
                                game_state.getValue()?.color === "b" ? 
                                // @ts-ignore
                            <p className="text-muted-foreground">{session.data.username + `${` #`}` + session.data.rating}</p>  :
                            <p className="text-muted-foreground">{game_state.getValue()?.opponent.username + `${` #`}` + game_state.getValue()?.opponent.rating}</p>
                            }
                        </div>
                        <div className="w-full flex items-center">
                            <Board board={board} make_move={send_move} game_id={game_id} color={orient}/>
                            <div>
                            <Button 
                            onClick={() => {
                                if(orient === "b")
                                    setOrient("w");
                                else 
                                    setOrient("b");
                            }}
                            size={"icon"} variant={"secondary"} className="items-center rounded-none"><FlipVertical/>
                            </Button>
                            </div>
                        </div>
                        <div className="dark:bg-zinc-800 md:w-[800px] w-[640px] p-4">
                            {
                            game_state.getValue()?.color === "w" ? 
                            // @ts-ignore
                            <p className="text-muted-foreground">{session.data.username + `${` #`}` + session.data.rating}</p>  :
                            <p className="text-muted-foreground">{game_state.getValue()?.opponent.username + `${` #`}` + game_state.getValue()?.opponent.rating}</p>
                            }
                        </div>
                    </div>
                    <div className="w-[640px] m-2">
                        <div className="flex items-center dark:bg-zinc-800 p-2 py-3">
                            <StarFilledIcon className="mx-2"/>
                            <h3 className="scroll-m-20 font-semibold tracking-tight">
                                Moves Played
                            </h3>
                        </div>
                        <ScrollArea className="md:h-[800px] h-[640px]">
                            <div 
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
                        </ScrollArea>
                    </div>
                </div> : 
                <div>Loading...</div>
            }
        </div>
    )
}