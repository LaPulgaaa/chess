import { WebSocketServer as WSSocketServer }from "ws";
import WebSocket from "ws";

import { RedisSubscriptionManager } from "./room_manager";
import * as game from "./game";
import type { Player, PlayerMoveIncomingData } from "./game";
import { start_queue_worker } from "./worker";

const WebSocketServer = WSSocketServer || WebSocket.Server;

const wss = new WebSocketServer({port: 8080}) ;

type WsClients = Record<number, {
    ws: WebSocket,
    room_id: string,
    user_id: string
}>;

export type User = Player | {
    type: "SPECTATOR",
    user_id: string
}

export type IncomingClientData = {
    type: "JOIN",
    game_id: string,
    user: User,
} | PlayerMoveIncomingData;

const ws_clients:WsClients = {};
let client_count = 0;
start_queue_worker();

wss.on("connection",(ws)=>{

    client_count += 1;
    console.log("connection made")

    ws.on("message", async(raw_data)=>{
        const incoming_data: IncomingClientData = JSON.parse(`${raw_data}`);
        const {type} = incoming_data;
        const {game_id} = incoming_data;

        switch(type){
            case "JOIN":{
                const user = incoming_data.user;
                const room_size = RedisSubscriptionManager.get_instance().get_room_size(game_id);
                let subscription_id = `${game_id}:watch`;
                if(user.type === "PLAYER" && room_size <2){
                    subscription_id = `${game_id}:play`;
                    if(room_size === 1){
                        const already_joined = RedisSubscriptionManager.get_instance().get_room_members(subscription_id)[0]!;
                        const already_joined_player = {
                            type: "PLAYER" as const,
                            user_id: already_joined.user_id,
                            color: already_joined.color!
                        }
                        game.create_game(game_id,already_joined_player,user);
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
            case "MOVE" : {
                const move = incoming_data.move;
                const player = incoming_data.user;
                const resp = await game.handle_move({
                    type: "MOVE" as const,
                    game_id,
                    user: player,
                    move,
                });
                if(resp !== undefined){
                    RedisSubscriptionManager.get_instance().message({
                        room_id: `${game_id}:play`,
                        payload: resp
                    });
                    RedisSubscriptionManager.get_instance().message({
                        room_id: `${game_id}:watch`,
                        payload: resp
                    })
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