import { createClient } from "redis";

import prisma from "@repo/prisma";
import {redis_queue_payload_schema} from "@repo/types";
import type { RedisQueuePayload } from "@repo/types";
import { Chess } from "chess.js";

export const client = createClient();

export async function start_queue_worker(){
    try{
        await client.connect();
        console.log("Queue worker ready....");
        while(true){
            try{
                const resp = await client.brPop("db",0);
                if(resp === null)
                continue;

                const raw_data = resp.element;
                push_move_into_db(raw_data);
                
            }catch(err){
                console.log(err);
            }
        }

    }catch(err){
        console.log(err);
        start_queue_worker();
    }
}

async function push_move_into_db(raw_data: string){
    try{
        const {from, to, prev_fen, player_id, game_id}
        :{from: string,to: string,prev_fen: string, player_id: string, game_id: string}
        = JSON.parse(raw_data);

        const game = new Chess(prev_fen);
        game.move({
            from,
            to,
        });
        await prisma.move.create({
            data: {
                playerId: player_id,
                move: to,
                beforeState: prev_fen,
                afterState: game.fen(),
                gameId: game_id
            }
        });
        await prisma.game.update({
            where: {
                uid: game_id
            },
            data: {
                currentState: game.fen(),
            }
        });
    }catch(err){
        console.log(err);
    }
}