import { WebSocketServer as WSSocketServer }from "ws";
import WebSocket from "ws";

import { RedisSubscriptionManager } from "./room_manager";
import { GameManager } from "./game_manager";
import assert from "minimalistic-assert";

const WebSocketServer = WSSocketServer || WebSocket.Server;

const wss = new WebSocketServer({port: 8080}) ;

type WsClients = Record<number, {
    ws: WebSocket,
    room_id: string,
    user_id: string
}>;

export type MessageType = "PLAY" | "JOIN";
export type MemberType = "PLAYER" | "SPECTATOR";

let ws_clients:WsClients = {};
let client_count = 0;

wss.on("connection",(ws)=>{

    client_count += 1;
    console.log("connection made")

    ws.on("message",(raw_data)=>{
        const data = JSON.parse(`${raw_data}`);

        const msg_type: MessageType = data.type;
        const room_id: string = data.room_id;
        const user_id: string = data.user_id;
        const type: MemberType = data.client.type;
        
        switch(msg_type){
            case "JOIN":
                let room_opcode;
                if(type === "PLAYER")
                {
                    const color: "white" | "black" = data.color;
                    room_opcode = `${room_id}_play`;
                    const players_in_room = RedisSubscriptionManager.get_instance().get_room_size(room_opcode);

                    // TODO: send a message to client notifying that
                    // room size is full
                    if(players_in_room >= 2){
                        room_opcode = `${room_id}_watch`;
                    }
                    else if(players_in_room == 1){
                        const already_joined = RedisSubscriptionManager.get_instance().get_room_members(room_opcode);
                        const white = color === "white" ? user_id : already_joined[0]!.user_id;
                        const black = white === user_id ? already_joined[0]!.user_id : user_id;
                        GameManager.get_instance().add_game
                        ({
                            game_id: room_id,
                            white,
                            black
                        })
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
                    ws,
                    user_id
                }}
                
                RedisSubscriptionManager.get_instance().subscribe({
                    room_id: room_opcode,
                    client:{
                        id:client_count.toString(),
                        ws,
                        user_id,
                    }
                })
                break;
            case "PLAY":
                const move = data.move;
                const resp = GameManager.get_instance().make_move({
                    game_id: room_id,
                    move,
                })
                if(resp !== undefined && typeof resp !== "string"){
                    RedisSubscriptionManager.get_instance().message({
                        room_id:`${room_id}_watch`,
                        payload: resp.after
                    });
                    RedisSubscriptionManager.get_instance().message({
                        room_id:`${room_id}_play`,
                        payload: resp.after
                    })
                }
                else{
                    RedisSubscriptionManager.get_instance().message({
                        room_id:`${room_id}_play`,
                        payload: resp ?? "error occured"
                    })
                }
                break;
        }
    })
    ws.on("close",()=>{
        if(ws_clients[client_count] !== undefined){
            const {room_id,user_id} = ws_clients[client_count]!;
            const id = client_count.toString();
            RedisSubscriptionManager.get_instance().unsubscribe({
                room_id,
                client:{
                    id,
                    ws,
                    user_id
                }
            });
            delete ws_clients[client_count];
            client_count -= 1;
        }
    })
})