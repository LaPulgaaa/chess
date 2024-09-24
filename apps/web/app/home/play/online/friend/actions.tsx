'use server'

import prisma from "@repo/prisma";

export async function get_friends(email: string){
    try{
        const resp = await prisma.user.findUnique({
            where: {
                email
            },
            select: {
                friends: {
                    select: {
                        username: true,
                        avatar: true,
                        email: true,
                    }
                }
            }
        });
        if(resp === null)
            return null;

        return resp.friends;
    }catch(err){
        console.log(err);
        return null;
    }
}

export async function search_users_by_creds(creds: string, client_email: string, client_username: string){
    try{
        const resp = await prisma.user.findMany({
            where: {
                username: {
                    contains: creds,
                    not: client_username
                },
                email: {
                    contains: creds,
                    not: client_email
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
            },
        take: 10
        });

        return resp;
    }catch(err){
        console.log(err);
        return [];
    }
}