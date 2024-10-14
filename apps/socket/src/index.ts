import { WebSocketServer as WSSocketServer }from "ws";
import WebSocket from "ws";
import { createClient } from "redis";

import { RedisSubscriptionManager } from "./room_manager";
import { type Player, type PlayerMoveIncomingData , process_move} from "./game";
import { start_queue_worker } from "./worker";
import { create_game } from "./utils";
import { GameManager } from "./game_manager";
import prisma from "@repo/prisma";

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
    type: "CHALLENGE",
    payload: {
        game_id: string,
        accept: boolean,
        host: {
            uid: string,
            color: "w" | "b",
        },
        invitee: {
            uid: string,
            color: "w" | "b"
        }
    }
} | {
    type: "PLAY",
    payload: {
        game_id: string,
        host: {
            uid: string,
            color: "w" | "b"
        },
        invitee: {
            uid: string,
            color: "w" | "b"
        }
    }
} | {
    type: "LEAVE",
} | {
    type: "BULK_SUBSCRIBE",
    payload: {
        user_id: string,
    }
} | {
    type: "BULK_UNSUBSCRIBE",
    payload: {
        user_id: string,
    }
};

const client = createClient();

const inroom_clients:WsClients = {};
export const online_clients: Record<number, {
    ws: WebSocket,
    username: string,
}> = {};
let client_count = 0;

start_queue_worker();

async function init_ws_server(){
    await client.connect();
    wss.on("connection",async(ws)=>{
    
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
                case "CHALLENGE":{
                    const was_challenge_accepted = data.payload.accept;
                    const invitee = data.payload.invitee;
                    const host = data.payload.host;
                    const maybe_online_invitee = Object.values(online_clients).find(
                        ({ username }) => username === invitee.uid
                    );
                    const maybe_online_host = Object.values(online_clients).find(
                        ({ username }) => username === host.uid
                    );
                    if(was_challenge_accepted === true && maybe_online_host && maybe_online_invitee){
    
                        maybe_online_host.ws.send(JSON.stringify({
                            type: "CHALLENGE",
                            data: JSON.stringify({
                                success: true,
                                host: {
                                    uid: data.payload.host.uid,
                                    color: data.payload.host.color
                                },
                                invitee: {
                                    uid: data.payload.invitee.uid,
                                    color: data.payload.invitee.color
                                },
                                game_id: data.payload.game_id,
                            })
                        }));
    
                        RedisSubscriptionManager.get_instance().subscribe({
                            room_id: data.payload.game_id,
                            client: {
                                user_id: data.payload.invitee.uid,
                                ws: ws,
                                id: ws_id.toString(),
                                color: data.payload.invitee.color,
                            }
                        });
    
                    }
                    
                    break;
                }
                case "PLAY": {
                    const game_id = data.payload.game_id;
                    
                    RedisSubscriptionManager.get_instance().subscribe({
                        room_id: game_id,
                        client: {
                            user_id: data.payload.host.uid,
                            ws: ws,
                            id: ws_id.toString(),
                            color: data.payload.host.color,
                        }
                    })
    
                    const userb = data.payload.host.color === "b" ? data.payload.host.uid : data.payload.invitee.uid;
                    const userw = data.payload.host.color === "w" ? data.payload.host.uid : data.payload.invitee.uid;
                    
                    await create_game(game_id,userw,userb);
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
                    const resp = process_move(data.payload);
                    if(resp !== undefined)
                    {
                        const payload = JSON.stringify({
                            type: "MOVE",
                            data: resp,
                        });
                        RedisSubscriptionManager.get_instance().message({
                            room_id: data.payload.game_id,
                            payload
                        })
                    }
                    const db_content = JSON.stringify({
                        player_id: data.payload.player.player_id,
                        game_id: data.payload.game_id,
                        from: data.payload.from,
                        to: data.payload.to,
                        prev_fen: data.payload.prev_fen
                    })
                    await client.lPush("db",db_content);
                    break;
                }
                case "BULK_SUBSCRIBE": {
                    try{
                        const resp = await prisma.player.findMany({
                            where: {
                                user:{
                                    username: data.payload.user_id
                                },
                                game: {
                                    status: {
                                        in: ["NOT_STARTED","IN_PROGRESS"],
                                    }
                                }
                            },
                            select:{
                                game: {
                                    select: {
                                        uid: true,
                                        players: {
                                            select: {
                                                color: true,
                                                id: true,
                                            }
                                        }
                                    },
                                    
                                },
                                color: true,
                            }
                        });
    
                        resp.forEach((player)=>{
                            RedisSubscriptionManager.get_instance().subscribe({
                                room_id: player.game.uid,
                                client: {
                                    ws,
                                    id: ws_id.toString(),
                                    color: player.color,
                                    user_id: data.payload.user_id,
                                }
                            });
                        });
                    }catch(err){
                        console.log(err);
                    }
                    break;
                }
                case "BULK_UNSUBSCRIBE": {
                    try{
                        const resp = await prisma.player.findMany({
                            where: {
                                user: {
                                    username: data.payload.user_id
                                },
                                game: {
                                    status: {
                                        in: ["IN_PROGRESS","NOT_STARTED"],
                                    }
                                }
                            },
                            select:{
                                game: {
                                    select: {
                                        uid: true,
                                    }
                                },
                                color: true,
                            }
                        });
    
                        resp.forEach((player)=>{
                            RedisSubscriptionManager.get_instance().unsubscribe({
                                room_id: player.game.uid,
                                client: {
                                    ws,
                                    user_id: data.payload.user_id,
                                    id: ws_id.toString(),
                                    color: player.color,
                                }
                            });
                        });
                    }catch(err){
                        console.log(err);
                    }
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
}

init_ws_server();