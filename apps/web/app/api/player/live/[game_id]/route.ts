import prisma from "@repo/prisma";
import assert from "minimalistic-assert";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest,{ params }: { params: Promise<{game_id: string}>}){
    const game_id = (await params).game_id;
    //@ts-ignore
    const token = await getToken({ req });

    if(token === null)
        return Response.json({
            message: "UNAUTHORISED",
        },{ status: 401 });
    
    //@ts-ignore
    const username:string = token.username;
    try{
        
        const resp = await prisma.player.findUnique({
            where: {
                userId_gameId: {
                    userId: username,
                    gameId: game_id
                }
            },
            select: {
                game: {
                    select: {
                        status: true,
                        currentState: true,
                        players: {
                            select: {
                                user: {
                                    select: {
                                        username: true,
                                        rating: true,
                                    }
                                }
                            }
                        },
                        moves: {
                            select: {
                                move: true,
                            }
                        }
                    }
                },
                color: true,
                id: true,
                gameId: true,
            }
        });

        if(resp === null)
            return Response.json({
                message: "RESOURCE UNAVAILABLE",
            },{ status: 404 });

        const opponent = resp.game.players.find((o) => o.user.username !== username);
        assert(opponent !== undefined);

        const data = {
            game_id: resp.gameId,
            color: resp.color,
            player_id: resp.id,
            fen: resp.game.currentState,
            plays: resp.game.moves.flatMap((m) => m.move),
            status: resp.game.status,
            opponent: opponent.user
        }

        return Response.json({
            message: "SUCCESS",
            raw_data: data,
        }, { status: 200 });


    }catch(err){
        console.log(err);
        return Response.json({
            message: "INTERNAL SERVER ERROR",
        },{ status: 500 });
    }
}