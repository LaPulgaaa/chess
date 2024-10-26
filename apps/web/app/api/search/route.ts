import prisma from "@repo/prisma";
import { NextRequest } from "next/server";

export async function GET(req:NextRequest){
    const creds: string = await req.json();

    try{
        const resp = await prisma.user.findMany({
            where: {
                username: {
                    contains: creds,
                    mode: "insensitive"
                },
                email: {
                    contains: creds,
                    mode: "insensitive",
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