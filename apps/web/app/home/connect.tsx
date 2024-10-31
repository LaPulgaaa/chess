'use client'

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRecoilRefresher_UNSTABLE, useSetRecoilState } from "recoil";

import { challenges, live_games_store } from "@repo/store";
import type { ChallengeRecieved } from "@repo/store";
import type { GameStartCallbackData } from "@repo/types";
import { ToastAction, useToast } from "@repo/ui";

import { SignallingManager } from "@/lib/singleton/signal_manager";
import { useRouter } from "next/navigation";


type ChallengeCallbackData = {
    success: false,
    invitee: string
} | ({
    success: true,
    host: {
        uid: string,
        color: "w" | "b",
    },
    invitee: {
        uid: string,
        color: "w" | "b"
    },
    game_id: string,
    variant: "RANDOM_INVITE" | "FRIEND_INVITE"
})

export default function Connect(){
    const router = useRouter();
    const session = useSession();
    const { toast } = useToast();
    const setMyChallenges = useSetRecoilState<ChallengeRecieved[]>(challenges);
    const refreshLiveGameState = useRecoilRefresher_UNSTABLE(live_games_store);

    const status = session.status;

    function start_game_callback(raw_data: string){
        const data:GameStartCallbackData = JSON.parse(raw_data);
        toast({
            duration: 2000,
            draggable: true,
            title: "Redirecting to new game..."
        });
        refreshLiveGameState();
        router.push(`/home/play/online/game/${data.game_id}`)
    }

    function recieve_challenge_callbacks(raw_data: string){
        const data:ChallengeRecieved = JSON.parse(raw_data);
        const host_color = data.host_color === "w" ? "black" : "white";
        setMyChallenges((challenges) => [...challenges,data]);
        toast({
            title: "You recieved a challenge",
            description: `${data.host_uid} challenged you for a game with ${host_color} pieces`,
            action: <ToastAction altText="Accepted">Accept</ToastAction>
        })
    }

    function send_challenge_callback(raw_data: string){
        const data:ChallengeCallbackData = JSON.parse(raw_data);
        if(data.success === false){
            const invitee = data.invitee;
            toast({
                variant: "destructive",
                title: "Challenge not accepted!",
                description: `${invitee} is currently offline!`
            })
        }
        else{
            const {host, invitee, game_id} = data;
            toast({
                title: "Challenge Accepted",
                description: `${invitee.uid} accepted your challenge`
            });

            const message = JSON.stringify({
                type: "PLAY",
                payload: {
                    game_id,
                    host: {
                        color: host.color,
                        uid: host.uid
                    },
                    invitee: {
                        color: invitee.color,
                        uid: invitee.uid
                    }
                }
            });
            SignallingManager.get_instance().HANDLE_MESSAGE(message);
        }
    }

    function play_random_callback(raw_data: string){
        const data:ChallengeCallbackData = JSON.parse(raw_data);
        if(data.success === false){
            toast({
                title: "Could not find an opponent!",
                description: "Please adjust rating deviation or try later."
            })
        }
    }

    useEffect(()=>{
        if(status === "authenticated"){
            //@ts-ignore
            const username = session.data.username;
            SignallingManager.get_instance(username);
            SignallingManager.get_instance().BULK_SUBSCRIBE(username);
            SignallingManager.get_instance().REGISTER_CALLBACK("INVITE",recieve_challenge_callbacks);
            SignallingManager.get_instance().REGISTER_CALLBACK("CHALLENGE", send_challenge_callback);
            SignallingManager.get_instance().REGISTER_CALLBACK("GAME_START", start_game_callback);
            SignallingManager.get_instance().REGISTER_CALLBACK("PLAY_RANDOM", play_random_callback);            
        }

        return ()=>{
            if(status === "authenticated"){
                //@ts-ignore
                const username = session.data.username;
                SignallingManager.get_instance(username).DEREGISTER_CALLBACK("INVITE");
                SignallingManager.get_instance().BULK_UNSUBSCRIBE(username);
                SignallingManager.get_instance().DEREGISTER_CALLBACK("CHALLENGE");
                SignallingManager.get_instance().DEREGISTER_CALLBACK("GAME_START");
                SignallingManager.get_instance().DEREGISTER_CALLBACK("PLAY_RANDOM");
            }
        }
    },[status])

    return(
        <></>
    )
}