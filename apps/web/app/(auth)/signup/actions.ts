'use server'

import prisma from "@repo/prisma";
import { z } from "zod";
import { user_signup_form_schema } from "@repo/types";

type FormData = z.infer<typeof user_signup_form_schema>;

export const is_username_taken = async(username: string) => {
    try{
        const possible_username = await prisma.user.findFirst({
            where: {
                username
            },
            select:{
                username: true
            }
        });

        if(possible_username !== null)
            return true;
        else 
            return false;
    }catch(err){
        console.log(err);
        return true;
    }
}

export const create_user = async(data:FormData) => {
    const user = await prisma.$transaction(async(tx)=>{
        const new_user = await tx.user.create({
            data:{
                username: data.username,
                email: data.email
            }
        });
        await tx.password.create({
            data: {
                hash: data.password,
                user_id: new_user.id
            }
        });

        return new_user.username;
    });

    return user;
}