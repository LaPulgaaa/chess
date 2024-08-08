import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({port: Number(process.env.WS_PORT)!});

type WsClients = Record<number, {
    ws: WebSocket,
    room_id: string
}>;

export type MessageType = "PLAY" | "WATCH" | "MOVE";

let ws_clients:WsClients = {};

wss.on("connection",(ws)=>{
    ws.on("message",(raw_data)=>{
        const data = JSON.parse(`${raw_data}`);

        const msg_type: MessageType = data.type;

        switch(msg_type){
            case "PLAY":

                break;
            case "MOVE":

                break;
            case "WATCH":

                break;
        }
    })
})