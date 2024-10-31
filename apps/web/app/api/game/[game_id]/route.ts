import prisma from "@repo/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, {params}:{params:{game_id: string}}){
    const game_id = params.game_id;
    try{
        const resp = await prisma.game.findUnique({
            where: {
                uid: game_id,
            },
            select: {
                currentState: true,
                players: {
                    select: {
                        user: {
                            select: {
                                username: true,
                                rating: true,
                            }
                        },
                        color: true,
                    }
                },
                moves: {
                    select: {
                        move: true,
                    }
                },
            }
        });

        return Response.json({
            message: 'SUCCESS',
            data: resp,
        });
    }catch(err){
        console.log(err);
    }
}