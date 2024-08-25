import { createClient } from "redis";
import { z } from "zod";

import prisma from "@repo/prisma";
import {redis_queue_payload_schema} from "@repo/types";

type PoppedData = "User" | "Player" | "Game" | "Move";

const client = createClient();

export async function start_queue_worker(){
    try{
        await client.connect();

        while(true){
            const resp = await client.brPop("db",0);
            if(resp === null)
            continue;

            const payload = resp.element;
            const {type, data} = redis_queue_payload_schema.parse(JSON.parse(payload));
            await handle_popped_data(type,data);
        }

    }catch(err){
        console.log(err);
        start_queue_worker();
    }
}

async function handle_popped_data(type:PoppedData, data: unknown){
    if(type === "Move"){
        // push move row to db
    }
}