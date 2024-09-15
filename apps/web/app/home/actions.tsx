'use server'

import prisma from "@repo/prisma";


export async function get_matches(email: string){
    try{
        const resp = await prisma.player.findMany({
            where:{
                user:{
                    email
                }
            },
            select: {
                game: {
                    select:{
                        players: {
                            select: {
                                user: {
                                    select: {
                                        username: true,
                                        avatar: true,
                                        rating: true,
                                    }
                                },
                                color: true,
                            }
                        },
                        createdAt: true,
                        plays: true,
                        status: true,
                    }
                }
            }
        });
        const games = resp.flatMap((r)=>r.game);
        return games;
    }catch(err){
        console.log(err);
        return [];
    }
}