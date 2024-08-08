import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({
    port: Number(process.env.WS_PORT || 8080)
});

type WsClient = Record<number, {
    room_id: string,
    ws: WebSocket
}>

let ws_clients: WsClient = {};

let connected_client = 0;

wss.on("connection",(ws)=>{

    console.log("connection made");

    ws.on("message",(raw_data)=>{
        const data = JSON.parse(raw_data.toString());

        const type = data.type;
        // join the room as a player or spectator
        switch(type){
            case "JOIN": 
                ws_clients[connected_client++] = {
                    room_id: "abad",
                    ws
                };
            break;
            case "MOVE": 
            break;
            default: 
            console.log("unknown message type")
        }

        // make a move 


    });

    ws.on("close",()=>{
        connected_client -= 1;
    })
})
