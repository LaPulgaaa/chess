import prisma from "@repo/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest){
    //@ts-ignore
    const token = await getToken({ req });

    if(token == null)
    return Response.json({
        message: "UNAUTHORISED_ACCESS"
    },{ status: 401 });

    try {
        //@ts-ignore
        const username: string = token.username;
        const resp = await prisma.challenge.findMany({
            where: {
                inviteeUid: username
            },
            select: {
                hostColor: true,
                gameId: true,
                variant: true,
                hostUser: {
                    select: {
                        username: true,
                        avatar: true,
                    }
                }
            }
        });

        return Response.json({
            message: "SUCCESS",
            data: resp,
        })
    }catch(err){
        console.log(err);
    }
    
}