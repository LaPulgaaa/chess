import { createClient } from "redis";

import prisma from "@repo/prisma";
import {redis_queue_payload_schema} from "@repo/types";
import type { RedisQueuePayload } from "@repo/types";

export const client = createClient();

export async function start_queue_worker(){
    try{
        await client.connect();

        while(true){
            try{
                const resp = await client.brPop("db",0);
                if(resp === null)
                continue;

                const raw_data = resp.element;
                const data = redis_queue_payload_schema.parse(JSON.parse(raw_data));
                await handle_popped_data(data);
            }catch(err){
                console.log(err);
            }
        }

    }catch(err){
        console.log(err);
        start_queue_worker();
    }
}

async function handle_popped_data(payload: RedisQueuePayload){
    try{
        if(payload.type === "Move") {
            const move_data = payload.data;
            await prisma.move.create({
                data: move_data
            })
        }
        else if(payload.type === "Player"){
            const player_data = payload.data;
            await prisma.player.create({
                data: player_data
            })
        }
    }catch(err){
        console.log(err);
        client.lPush("db",JSON.stringify(payload));
    }
}