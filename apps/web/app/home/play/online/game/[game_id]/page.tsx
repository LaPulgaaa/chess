'use client'

import { get_game_from_id } from "@repo/store";
import Board from "../../board";
import type { Square, PieceSymbol, Color} from "chess.js"
import { useSession } from "next-auth/react";
import { useRecoilValueLoadable } from "recoil";
import { useEffect, useState } from "react";
import { SignallingManager } from "@/lib/singleton/signal_manager";
import { GameManager } from "@/lib/singleton/game_manager";

type MoveCallbackData = {
    from: string,
    to: string,
    color: "w" | "b",
}

type Board = ({
    square: Square;
    type: PieceSymbol;
    color: Color;
} | null)[][];

export default function Game({params}:{params: {game_id: string}}){
    const game_id = params.game_id;
    const session = useSession();
    //@ts-ignore
    const game_state = useRecoilValueLoadable(get_game_from_id({username: session?.data?.username ?? undefined, game_id}));
    const [board,setBoard] = useState<Board | undefined>(undefined);

    function move_callback(raw_data:string){
        const data:MoveCallbackData = JSON.parse(raw_data);
        let updated_state = GameManager.get_instance().make_move(game_id,data.from,data.to);
        setBoard(updated_state)
    }

    function send_move(from: string,to: string){
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
                prev_fen: GameManager.get_instance().get_game_fen(game_id)
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
        }
    },[game_state.state]);

    return (
        <div>
            {
                game_state.state === "hasValue" && game_state.getValue() !== null && board ? 
                <div className="flex lg:flex-row flex-col justify-between m-12 space-x-2">
                    <Board board={board} make_move={send_move} game_id={game_id}/>
                    <div className="w-full">Record moves her</div>
                </div> : 
                <div>Loading...</div>
            }
        </div>
    )
}