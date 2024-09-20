import prisma from "@repo/prisma";
import { NextRequest } from "next/server";

export async function GET(req:NextRequest){
    const creds: string = await req.json();

    try{
        const resp = await prisma.user.findMany({
            where: {
                username: {
                    contains: creds,
                },
                email: {
                    contains: creds,
                }
            },
            select:{
                username: true,
                email: true,
                avatar: true,
                rating: true,
                name: true,
                createdAt: true,
            },
            orderBy: {
                rating: "desc"
            }
        });

        return Response.json({})
    }catch(err){
        console.log(err);
        return Response.json({
            msg: "Internal Server Error"
        },{status: 500})
    }
}