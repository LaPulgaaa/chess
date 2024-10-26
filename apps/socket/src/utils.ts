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
            const new_game = await tx.game.create({
                data:{
                    uid: game_id,
                    status: "IN_PROGRESS"
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
                        userId: userw,
                        color: "w",
                        gameId: new_game.uid,
                        gameToken: game_token
                    },
                    {
                        userId: userb,
                        color: "b",
                        gameId: new_game.uid,
                        gameToken: game_token
                    }
                ],
                select:{
                    id: true,
                    gameToken: true,
                },
            });

            let players_sorted_alphabetically = [userb,userw].sort();

            await tx.friend.upsert({
                where: {
                    userFromId_userToId: {
                        userFromId: players_sorted_alphabetically[0]!,
                        userToId: players_sorted_alphabetically[1]!,
                    }
                },
                create: {
                    userFromId: players_sorted_alphabetically[0]!,
                    userToId: players_sorted_alphabetically[1]!,
                    games: 0,
                    won: 0,
                    draw: 0,
                },
                update: {
                    games: {
                        increment: 1,
                    },
                    latestMatchAt: new Date().toISOString(),
                }
            })

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