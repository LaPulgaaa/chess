import { WebSocketServer as WSSocketServer }from "ws";
import WebSocket from "ws";
import type { Square } from "chess.js";

import { RedisSubscriptionManager } from "./room_manager";
import { GameManager } from "./game_manager";

const WebSocketServer = WSSocketServer || WebSocket.Server;

const wss = new WebSocketServer({port: 8080}) ;

type WsClients = Record<number, {
    ws: WebSocket,
    room_id: string,
    user_id: string
}>;

export type Color = "white" | "black";

type User = {
    type: "PLAYER",
    user_id: string,
    color: Color
} | {
    type: "SPECTATOR",
    user_id: string
}

export type IncomingClientData = {
    type: "JOIN",
    game_id: string,
    user: User,
} | {
    type: "MOVE",
    game_id: string,
    user: User,
    move: Square,
};

const ws_clients:WsClients = {};
let client_count = 0;

wss.on("connection",(ws)=>{

    client_count += 1;
    console.log("connection made")

    ws.on("message",(raw_data)=>{
        const incoming_data: IncomingClientData = JSON.parse(`${raw_data}`);
        const {type} = incoming_data;
        const {user,game_id} = incoming_data;

        switch(type){
            case "JOIN":{
                const room_size = RedisSubscriptionManager.get_instance().get_room_size(game_id);
                let subscription_id = `${game_id}:watch`;

                if(user.type === "PLAYER" && room_size <2){
                    subscription_id = `${game_id}:play`;
                    if(room_size === 1){
                        const already_joined_player = RedisSubscriptionManager.get_instance().get_room_members(subscription_id)[0]!;
                        const white = already_joined_player.color === "white" ? already_joined_player.user_id : user.user_id;
                        const black = already_joined_player.user_id === white ? user.user_id : already_joined_player.user_id;
                        GameManager.get_instance().add_game({
                            game_id,
                            white,
                            black
                        })
                    }

                   
                    RedisSubscriptionManager.get_instance().subscribe({
                        room_id: subscription_id,
                        client:{
                            ws,
                            id: client_count.toString(),
                            user_id: user.user_id,
                            color: user.color
                        }
                    })
                }
                else{
                    RedisSubscriptionManager.get_instance().subscribe({
                        room_id: subscription_id,
                        client:{
                            ws,
                            id: client_count.toString(),
                            user_id: user.user_id
                        }
                    })
                }

                ws_clients[client_count] = {
                    ws,
                    room_id: subscription_id,
                    user_id: user.user_id
                }

                break;
            }
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