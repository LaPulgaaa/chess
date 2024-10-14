import { Chess } from "chess.js";

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
        promotion?: string,
    }
}

export function process_move(incoming_data: PlayerMoveIncomingData["payload"]){
    try{
        const game = new Chess(incoming_data.prev_fen);

        game.move({
            from: incoming_data.from,
            to: incoming_data.to,
            promotion: incoming_data.promotion,
        });

        const is_checkmate = game.isCheckmate();
        const is_draw = game.isDraw() || game.isInsufficientMaterial();
        const is_game_over = game.isGameOver();

        const payload = {
            from: incoming_data.from,
            to: incoming_data.to,
            color: incoming_data.player.color,
            promotion: incoming_data.promotion,
            is_checkmate,
            is_draw,
            is_game_over,
        };

        return JSON.stringify(payload);

    }catch(err){
        console.log(err);
        return undefined;
    }
}