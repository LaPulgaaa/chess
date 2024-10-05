import { NextRequest } from "next/server";

import prisma from "@repo/prisma";

export async function GET(req:NextRequest, {params}:{params: {username: string}}){
    const username = params.username;

    try{
        const resp = await prisma.player.findMany({
            where: {
                user: {
                    username: username
                },
                game: {
                    status: {
                        in: ["IN_PROGRESS","NOT_STARTED"]
                    }
                }
            },
            select: {
                game: {
                    select: {
                        status: true,
                        plays: true,
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
                        }
                    }
                },
                color: true,
                id: true,
                gameId: true,
            }
        });

        const live_matches = resp.flatMap((p) => {
            const opponent = p.game.players.find((o) => o.user.username !== username);
            return {
                game_id: p.gameId,
                color: p.color,
                player_id: p.id,
                fen: p.game.currentState,
                plays: p.game.plays,
                status: p.game.status,
                opponent: opponent?.user
            }
        });

        return Response.json({
            msg: "Success",
            data: live_matches
        })
    }catch(err){
        return Response.json({
            msg: "Could not fetch games"
        })
    }
}
