import { GameManager } from "./game_manager";

export type Color = "white" | "black";

export type Player = {
    type: "PLAYER",
    user_id: string,
    color: Color
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