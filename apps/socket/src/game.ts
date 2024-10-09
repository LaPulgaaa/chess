import type { Square } from "chess.js";

import { GameManager } from "./game_manager";

export type Player = {
    player_id: string,
    color: "b" | "w"
}

export type PlayerMoveIncomingData = {
    type: "MOVE",
    payload: {
        game_id: string,
        player: Player,
        from: string,
        to: string,
        prev_fen: string,
    }
}

export function handle_move(incoming_data: PlayerMoveIncomingData["payload"]){

    try{
        const payload = {
            from: incoming_data.from,
            to: incoming_data.to,
            color: incoming_data.player.color,
        };

        return JSON.stringify(payload);
    }catch(err){
        console.log(err);
        return undefined;
    }
}
