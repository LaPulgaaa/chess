import type { Square } from "chess.js";

import { GameManager } from "./game_manager";
import type {Color} from "@repo/types";

export type Player = {
    type: "PLAYER",
    user_id: string,
    color: Color
}

export type PlayerMoveIncomingData = {
    type: "MOVE",
    game_id: string,
    user: Player,
    move: Square,
}

export function create_game(game_id: string,already_joined_player: Player, joined_now: Player){
    const white = already_joined_player.color === "white" ? already_joined_player.user_id : joined_now.user_id;
    const black = already_joined_player.user_id === white ? joined_now.user_id : already_joined_player.user_id;
    GameManager.get_instance().add_game({
        game_id,
        white,
        black
    })
}

export function handle_move(incoming_data: PlayerMoveIncomingData){
    const game = GameManager.get_instance().get_game(incoming_data.game_id);

    if(game === undefined)
        return undefined;

    try{
        const resp = game.chess.move(incoming_data.move);
        const is_game_over = game.chess.isGameOver();
        // Doing DB stuff here.

        const outgoing_data = {
            after: resp.after,
            from: resp.from,
            to: resp.to,
            over: is_game_over,
            turn: game.chess.turn()
        }
        return JSON.stringify(outgoing_data);
    }catch(err){
        console.log(err);
        return "INVALID MOVE";
    }
}
