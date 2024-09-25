import jwt from "jsonwebtoken";

import { GameManager } from "./game_manager";
import prisma from "@repo/prisma";
import { RedisSubscriptionManager } from "./room_manager";


export async function create_game(game_id: string, userw: string, userb: string){
    try{
        const game_token = jwt.sign({
            game_id,
            w: userw,
            b: userb
        },process.env.GAME_TOKEN ?? "supersecret");

        const resp = await prisma.$transaction(async(tx)=>{
            const userw_id = await tx.user.findUnique({
                where: {
                    username: userw
                },
                select: {
                    id: true,
                }
            });
            const userb_id = await tx.user.findUnique({
                where: {
                    username: userb
                },
                select:{
                    id: true,
                }
            });

            if(userb_id === null || userw_id === null)
                throw new Error("Users do not exist");

            const new_game = await tx.game.create({
                data:{
                    uid: game_id,
                    status: "NOT_STARTED"
                },
                select: {
                    currentState: true,
                    id: true,
                    uid: true,
                }
            });

            const players = await tx.player.createManyAndReturn({
                data: [
                    {
                        userId: userw_id.id,
                        color: "WHITE",
                        gameId: new_game.uid,
                        gameToken: game_token
                    },
                    {
                        userId: userb_id.id,
                        color: "BLACK",
                        gameId: new_game.uid,
                        gameToken: game_token
                    }
                ],
                select:{
                    id: true,
                    gameToken: true,
                }
            });

            return {
                w: players[0]?.id!,
                b: players[1]?.id!,
                fen: new_game.currentState,
            }

        });

        GameManager.get_instance().add_game({
            game_id: game_id,
            white: resp.w,
            black: resp.b
        });


        const payload = {
            type: "GAME_START",
            data: JSON.stringify({
                game_id: game_id,
                w: {
                    uid: userw,
                    pid: resp.w,
                },
                b: {
                    uid: userb,
                    pid: resp.b,
                },
                fen: resp.fen,
            })
        }

        RedisSubscriptionManager.get_instance().message({
            room_id: game_id,
            payload: JSON.stringify(payload)
        });

    }catch(err){
        console.log(err);
        RedisSubscriptionManager.get_instance().message({
            room_id: game_id,
            payload: JSON.stringify({
                type: "GAME_ERROR",
                data: "COULD_NOT_CREATE_GAME"
            })
        });
    }
}