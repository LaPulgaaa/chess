import { createClient } from "redis";

import prisma from "@repo/prisma";
import {redis_queue_payload_schema} from "@repo/types";
import type { RedisQueuePayload } from "@repo/types";
import { Chess } from "chess.js";
import assert from "minimalistic-assert";

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

                const raw_data = JSON.parse(resp.element);
                const data = redis_queue_payload_schema.parse(raw_data);
                push_move_into_db(data);
                
            }catch(err){
                console.log(err);
            }
        }

    }catch(err){
        console.log(err);
        start_queue_worker();
    }
}

async function push_move_into_db(payload: RedisQueuePayload){
    try{
        if(payload.type === "MOVE"){
            const {from, to, prev_fen, player_id, game_id} = payload.data;

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
        }
        else if(payload.type === "GAME_STATUS"){
            const { game_id, status} = payload.data;
            if(status.updated_status === "IN_PROGRESS"){
                return;
            }
            else{
                const { players } = await prisma.game.update({
                    where: {
                        uid: game_id
                    },
                    data: {
                        status: "ENDED",
                        endedAt: status.ended_at,
                    },
                    select: {
                        players: true,
                    }
                });

                if(status.updated_status === "ENDED"){
                    const { winner,loser } = players[0]?.id === status.winner.player_id ?
                    {
                        winner: players[0],
                        loser: players[1]
                    } : 
                    {
                        winner: players[1],
                        loser: players[0]
                    };
    
                    assert( winner !== undefined );
                    assert( loser !== undefined );
    
                    await prisma.$transaction(async (tx) => {
                        await tx.player.update({
                            where: {
                                id: winner.id,
                            },
                            data: {
                                result: "WON",
                                finishedGame: true,
                            }
                        })
                        await tx.player.update({
                            where: {
                                id: loser.id,
                            },
                            data: {
                                result: "LOST",
                                finishedGame: true,
                            }
                        })
                    })
                }
                else if(status.updated_status === "DREW"){
                    await prisma.$transaction(async(tx) => {
                        await tx.player.updateMany({
                            where: {
                                gameId: game_id
                            },
                            data: {
                                result: "DRAW",
                                finishedGame: true,
                            }
                        })
                    })
                }
            }
            
        }
    }catch(err){
        console.log(err);
    }
}