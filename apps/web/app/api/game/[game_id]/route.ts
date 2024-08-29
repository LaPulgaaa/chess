import { cookies } from "next/headers";

import prisma from "@repo/prisma";

export async function POST(
    request: Request,
    { params }: {params: {game_id: string }},
){
    const game_id = params.game_id;
    const { white , black } = await request.json();
    const cookiesStore = cookies();
    const game_token = cookiesStore.get('game');
    try{
        const res = await prisma.$transaction(async(tx) => {
            tx.game.create({
                data: {
                    uid: game_id,
                    status: "NOT_STARTED",
                }
            })
            const new_player_ids = await tx.player.createManyAndReturn({
                data:[
                    {
                        gameId: game_id,
                        color: "WHITE",
                        userId: white,
                        finishedGame: false,
                        gameToken: game_token?.value ?? "foo"
                    },
                    {
                        gameId: game_id,
                        color: 'BLACK',
                        userId: black,
                        finishedGame: false,
                        gameToken: game_token?.value ?? "foo"
                    }
                ],
                select:{
                    id: true,
                    color: true,
                }
            });

            return new_player_ids;
        })
        return Response.json({
            success: true,
            raw_data: res,
        },{
            status: 201,
        });
    }catch(err){
        return new Response('Error!',{
            status: 400
        })
    }
}