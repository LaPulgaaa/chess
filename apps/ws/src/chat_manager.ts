import assert from "minimalistic-assert";

import { createClient } from "redis";
import type { RedisClientType } from "redis";

type Client = {
    ws: WebSocket,
    client_id: string,
}

export class RedisSubscriptionManager {
    private static instance:RedisSubscriptionManager;
    private subscriber: RedisClientType;
    private publisher: RedisClientType;
    // key: client_id value: room_id of all the rooms joined
    private subscriptions: Map<string, string[]>;
    // key: room_id value: all the clients joined to this room
    private reverse_subscription: Map<string, Record<string, {
        ws: WebSocket,
        client_id: string
    }>>;

    constructor() {
        this.publisher = createClient();
        this.subscriber= createClient();
        this.subscriptions = new Map();
        this.reverse_subscription = new Map();
    }

    public static get_instance():RedisSubscriptionManager {
        if(RedisSubscriptionManager.instance){
            return RedisSubscriptionManager.instance;
        }

        return new RedisSubscriptionManager();
    }

    public create_subscription({room_id, client}:
    {
        room_id: string,
        client: Client
    }
    )
    {
        // We "SUBSCRIBE" to the "CHANNEL" only once -- when the first member joins
        // for the later users we just "PUBLISH" to channel and the joined members/clients
        // are sent message using `reverse_subscription`

        const already_joined_room_ids = this.subscriptions.get(client.client_id) ?? [];
        this.subscriptions.set(client.client_id,[...already_joined_room_ids,room_id]);

        const clients_already_in_room = this.reverse_subscription.get(room_id) ?? {};
        
        this.reverse_subscription.set(room_id,{...clients_already_in_room, [client.client_id]:{
            ws: client.ws,
            client_id: client.client_id
        }});

        const room_size = Object.keys(this.reverse_subscription.get(room_id) ?? {}).length;

        if(room_size == 1){

            let updated_clients_in_room = this.reverse_subscription.get(room_id);
            assert(updated_clients_in_room !== undefined, "Room should have one client at this point");

           this.subscriber.subscribe(room_id, (payload)=>{
            // this callback executes everytime message is "PUBLISHED" to channel
            // `room_id`
            try{
                Object.values(updated_clients_in_room).forEach(({ws})=>{
                    ws.send(payload);
                })
            }catch(err){
                console.log(err);
            }
           })

        }
        
        

    }

}