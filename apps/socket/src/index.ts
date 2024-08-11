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

let ws_clients:WsClients = {};
let client_count = 0;

wss.on("connection",(ws)=>{

    client_count += 1;

    ws.on("message",(raw_data)=>{
        const data = JSON.parse(`${raw_data}`);

        const msg_type: MessageType = data.type;
        const room_id: string = data.room_id;
        const type: MemberType = data.client.type;

        switch(msg_type){
            case "JOIN":
                let room_opcode;
                if(type === "PLAYER")
                {
                    room_opcode = `${room_id}_play`;
                    const players_in_room = RedisSubscriptionManager.get_instance().get_room_size(room_opcode);

                    // TODO: send a message to client notifying that
                    // room size is full
                    if(players_in_room >= 2){
                        room_opcode = `${room_id}_watch`;
                    }
                }
                else if(type === "SPECTATOR"){
                    room_opcode = `${room_id}_watch`;
                }
                else{
                    throw new Error("Invalid type of message");
                }

                assert(room_opcode !== undefined);

                ws_clients = {...ws_clients,[client_count]:{
                    room_id: room_opcode,
                    ws
                }}
                
                RedisSubscriptionManager.get_instance().subscribe({
                    room_id: room_opcode,
                    client:{
                        id:client_count.toString(),
                        ws
                    }
                })
                break;
            case "PLAY":
                break;
        }
    })
    ws.on("close",()=>{
        if(ws_clients[client_count] !== undefined){
            const {room_id} = ws_clients[client_count]!;
            const id = client_count.toString();
            RedisSubscriptionManager.get_instance().unsubscribe({
                room_id,
                client:{
                    id,
                    ws
                }
            });
            delete ws_clients[client_count];
            client_count -= 1;
        }
    })
})