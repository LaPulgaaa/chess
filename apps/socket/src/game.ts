import { GameManager } from "./game_manager";
import type { Square } from "chess.js";

export type Color = "white" | "black";

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
    const resp = GameManager.get_instance().make_move({
        game_id: incoming_data.game_id,
        move: incoming_data.move
    });

    if(resp !== undefined && typeof resp !== "string"){
        return resp.after;
    }

    return resp;
}