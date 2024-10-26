
type BufferedMessage = {
    id: number,
    message: string,
}

export type InviteMessage = {
    invitee_uid: string,
    host_uid: string,
    game_id: string,
    host_color: "w" | "b" | "r",
    host_avatar: string,
}

export class SignallingManager {
    private static instance: SignallingManager;
    private ws: WebSocket;
    private buffered_message: BufferedMessage[] = [];
    private callbacks: Record<string, (data: string)=>void> = {};
    private initialised: boolean = false;
    private id: number;
    private back_off_interval: number;
    private username: string;

    private constructor(username: string){
        this.back_off_interval = 0;
        this.ws = new WebSocket("ws://localhost:8080");
        this.id = 1;
        this.username = username;
        this.init_ws();
    }

    public static get_instance(username?: string) {
        if(!SignallingManager.instance){
            SignallingManager.instance = new SignallingManager(username!);
        }

        return SignallingManager.instance;
    }

    private init_ws(){
        this.ws.onopen = () =>{
            this.initialised = true;
            this.buffered_message.map(({message})=>{
                this.ws.send(message);
            })
        }

        this.ws.onmessage = (event) =>{
            const payload = JSON.parse(`${event.data}`);
            const type: string = payload.type;
            const data: string = payload.data;

            const callback = this.callbacks[type];
            if(callback !== undefined){
                callback(data);
            }

        }

        this.ws.onclose = () =>{
            setInterval(()=>{
                this.back_off_interval += 1000;
                this.init_ws();
            },this.back_off_interval)
        }

        this.CONNECT()
    }

    private CONNECT(){
        const message = JSON.stringify({
            type: "JOIN",
            payload: {
                username: this.username,
            },
        })

        this.handle_send(message);
    }

    BULK_SUBSCRIBE(user_id: string){
        const message = JSON.stringify({
            type: 'BULK_SUBSCRIBE',
            payload: {
                user_id,
            }
        });

        this.handle_send(message);
    }

    BULK_UNSUBSCRIBE(user_id: string){
        const message = JSON.stringify({
            type: "BULK_UNSUBSCRIBE",
            payload: {
                user_id,
            }
        });
        this.handle_send(message);
    }

    LEAVE(){
        const message = JSON.stringify({
            type: "LEAVE",
        });

        this.handle_send(message);
    }

    REGISTER_CALLBACK(type: string, callback: (data: string)=>void){
        this.callbacks = {...this.callbacks, [type]:callback};
    }

    DEREGISTER_CALLBACK(type: string){
        delete this.callbacks[type];
    }

    INVITE(data: InviteMessage){
        const { game_id, invitee_uid, host_avatar, host_color, host_uid } = data;
        const message = JSON.stringify({
            type: "INVITE",
            payload: {
                game_id,
                invitee_uid,
                host_uid,
                host_color,
                host_avatar
            },
        })

        this.handle_send(message);
    }

    ADD_AVAILABLE(data: string){
        this.handle_send(data);
    }

    REMOVE_AVAILABLE(data: string){
        this.handle_send(data);
    }

    PLAY_RANDOM(data: string){
        this.handle_send(data);
    }

    CHALLENGE(data: string){
        this.handle_send(data);
    }

    PLAY(message: string){
        this.handle_send(message);
    }

    MOVE(message: string){
        this.handle_send(message);
    }

    private handle_send(message: string){
        if(!this.initialised){
            this.buffered_message.push({
                id: this.id++,
                message,
            })

            return;
        }

        this.ws.send(message);
    }
}