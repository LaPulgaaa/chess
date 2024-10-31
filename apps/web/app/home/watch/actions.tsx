'use server'

import { Match } from "../games_table";
import prisma from "@repo/prisma";

export type LiveGametoWatch = Omit<Match, "status">;

export async function get_top_live_games(admin_username: string | undefined | null){
    if(admin_username === undefined || admin_username === null)
        return [];
    try{
        const resp = await prisma.game.findMany({
            where: {
                status: {
                    in: ["IN_PROGRESS","NOT_STARTED"]
                },
                players: {
                    none: {
                        user: {
                            email: admin_username
                        }
                    }
                }
            },
            select: {
                uid: true,
                players: {
                    select: {
                        user: {
                            select: {
                                avatar: true,
                                username: true,
                                rating: true,
                            }
                        },
                        color: true,
                        result: true,
                    }
                },
                moves: {
                    select: {
                        move: true,
                    }
                },
                createdAt: true,
            },
            take: 10
        });

        return resp;

    }catch(err){
        console.log(err);
        return [];
    }
}