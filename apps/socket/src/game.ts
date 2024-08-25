import type { Square } from "chess.js";

import { GameManager } from "./game_manager";
import { client } from "./worker";
import type {Color} from "@repo/types";
import { RedisQueuePayload } from "@repo/types";

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
    try{
        GameManager.get_instance().add_game({
            game_id,
            white,
            black
        });
    }catch(err){
        console.log(err);
    }
}

export async function handle_move(incoming_data: PlayerMoveIncomingData){
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
        const queue_payload: RedisQueuePayload = {
            type: "Move" as const,
            data: {
                gameId: incoming_data.game_id,
                move: incoming_data.move,
                beforeState: resp.before,
                afterState: resp.after,
                playerId: incoming_data.user.user_id,
                playedAt: new Date().toUTCString(),
                desc: game.chess.getComment(),
            }
        };
        await client.lPush("db",JSON.stringify(queue_payload));

        return JSON.stringify(outgoing_data);
    }catch(err){
        console.log(err);
        return "INVALID MOVE";
    }
}
