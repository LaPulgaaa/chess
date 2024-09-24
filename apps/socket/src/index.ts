import { WebSocketServer as WSSocketServer }from "ws";
import WebSocket from "ws";

import { RedisSubscriptionManager } from "./room_manager";
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
    payload: {
        username: string,
    }
} | PlayerMoveIncomingData | {
    type: "INVITE",
    payload: {
        game_id: string,
        host_uid: string,
        host_avatar: string,
        invitee_uid: string,
        host_color: "w" | "b" | "r"
    }
} | {
    type: "PLAY",
    payload: {
        game_uid: string,
        player_uid: string,
    }
} | {
    type: "LEAVE",
};

const inroom_clients:WsClients = {};
export const online_clients: Record<number, {
    ws: WebSocket,
    username: string,
}> = {};
let client_count = 0;
start_queue_worker();

wss.on("connection",(ws)=>{

    const ws_id = client_count++;

    ws.on("message", async(raw_data)=>{
        const data:IncomingClientData = JSON.parse(`${raw_data}`);
        const type = data.type;
        switch(type){
            case "JOIN": {
                const username = data.payload.username;
                online_clients[ws_id] = {
                    ws,
                    username,
                };
                break;
            }
            case "INVITE": {
                const invitee = data.payload.invitee_uid;
                const may_be_online_invitee = Object.values(online_clients).find(({username})=> username === invitee);
                if(may_be_online_invitee !== undefined){
                    const invitee_ws = may_be_online_invitee.ws;
                    invitee_ws.send(JSON.stringify({
                        type: "INVITE",
                        data: JSON.stringify({
                            host_uid: data.payload.host_uid,
                            host_color: data.payload.host_color,
                            host_avatar: data.payload.host_avatar,
                            game_id: data.payload.game_id
                        })
                    }))
                }
                else {
                    ws.send(JSON.stringify({
                        type: "CHALLENGE",
                        data: JSON.stringify({
                            success: false,
                            invitee
                        })
                    }))
                }
                break;
            }
            case "PLAY": {
                const game_uid = data.payload.game_uid;
                const player_uid = data.payload.player_uid;
                RedisSubscriptionManager.get_instance().subscribe({
                    room_id: game_uid,
                    client: {
                        user_id: player_uid,
                        ws,
                        id: client_count.toString(),
                    }
                })
                inroom_clients[client_count] = {
                    ws,
                    user_id: player_uid,
                    room_id: game_uid,
                }
            }
            case "LEAVE": {
                if(inroom_clients[client_count] !== undefined){
                    const {room_id,user_id} = inroom_clients[client_count]!;
                    const id = client_count.toString();
                    RedisSubscriptionManager.get_instance().unsubscribe({
                        room_id,
                        client:{
                            id,
                            ws,
                            user_id
                        }
                    });
                }
                break;
            }
            case "MOVE": {
                
                break;
            }
        }
    })
    ws.on("close",()=>{
        if(online_clients[ws_id]){
            console.log(online_clients[ws_id]?.username + "just went offline");
            delete online_clients[ws_id];
        }
    })
})