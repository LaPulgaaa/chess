import { Chess } from "chess.js";

import { client } from ".";

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

export async function process_move(incoming_data: PlayerMoveIncomingData["payload"]){
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
        let winner: {
            color: "w" | "b",
            player_id: string,
        } | "NA" = "NA" as const;

        if(is_game_over === true){
            let payload = "";
            if( is_checkmate === true ) {
                winner = incoming_data.player;
                payload = JSON.stringify({
                    type: "GAME_STATUS",
                    data: {
                        game_id: incoming_data.game_id,
                        status: {
                            updated_status: "ENDED",
                            winner: incoming_data.player,
                            ended_at: new Date().toISOString(),
                        },
                    }
                });
            }
            else if( is_draw === true ) {
                payload = JSON.stringify({
                    type: "GAME_STATUS",
                    data: {
                        game_id: incoming_data.game_id,
                        status: {
                            updated_status: "DREW",
                            ended_at: new Date().toISOString(),
                        },
                    }
                });
            }
            await client.lPush("db",payload);
        }

        const payload = {
            from: incoming_data.from,
            to: incoming_data.to,
            color: incoming_data.player.color,
            promotion: incoming_data.promotion,
            is_checkmate,
            is_draw,
            is_game_over,
            winner,
            updated_fen: game.fen(),
        };

        return JSON.stringify(payload);

    }catch(err){
        console.log(err);
        return undefined;
    }
}