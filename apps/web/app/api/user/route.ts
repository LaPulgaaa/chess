import prisma from "@repo/prisma";
import { user_signin_form_schema } from "@repo/types";

export async function POST(req: Request){
    const raw_data = await req.json();
    try{
        const data = user_signin_form_schema.parse(raw_data);
        const username = await prisma.$transaction(async(tx)=>{
            const new_user = await tx.user.create({
                data:{
                    username: data.email,
                    email: data.email
                }
            });
            await tx.password.create({
                data: {
                    hash: data.password,
                    user_id: new_user.id
                }
            });

            return new_user.username
        })
        return Response.json({
            msg: "success",
            data: username
        },{ status: 201 });
    }catch(err){
        return new Response('Could not signup',{
            status: 400,
        });
    }
}