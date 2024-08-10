import WebSocket, { WebSocketServer } from "ws";

import { RedisSubscriptionManager } from "./chat_manager";
import assert from "minimalistic-assert";

const wss = new WebSocketServer({port: Number(process.env.WS_PORT)!});

type WsClients = Record<number, {
    ws: WebSocket,
    room_id: string
}>;

export type MessageType = "PLAY" | "JOIN";
export type MemberType = "PLAYER" | "SPECTATOR";

const ws_clients:WsClients = {};

wss.on("connection",(ws)=>{
    ws.on("message",(raw_data)=>{
        const data = JSON.parse(`${raw_data}`);

        const msg_type: MessageType = data.type;
        const room_id: string = data.room_id;
        const client_id: string = data.client.id;
        const type: MemberType = data.client.type;


        switch(msg_type){
            case "JOIN":
                let room_opcode;
                if(type === "PLAYER")
                {
                    room_opcode = `${room_id}_player`;
                    const players_in_room = RedisSubscriptionManager.get_instance().get_room_size(room_opcode);
                    if(players_in_room >= 2){
                        // TODO: send a message to client notifying that 
                        // room size is full
                        room_opcode = `${room_id}_spec`;  
                    }
                }
                else if(type === "SPECTATOR"){
                    room_opcode = `${room_id}_spec`;
                }
                else{
                    throw new Error("Invalid type of message");
                }
                assert(room_opcode !== undefined);
                
                RedisSubscriptionManager.get_instance().subscribe({
                    room_id: room_opcode,
                    client:{
                        id:client_id,
                        ws
                    }
                })
                break;
            case "PLAY":
                break;
        }
    })
})