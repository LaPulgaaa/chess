'use client'

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSetRecoilState } from "recoil";

import {challenges} from "@repo/store";
import type { ChallengeRecieved } from "@repo/store";

import { SignallingManager } from "@/lib/singleton/signal_manager";
import { ToastAction, useToast } from "@repo/ui";

type ChallengeCallbackData = {
    success: boolean,
    invitee: string,
}

export default function Connect(){
    const session = useSession();
    const { toast } = useToast();
    const setMyChallenges = useSetRecoilState<ChallengeRecieved[]>(challenges);

    const status = session.status;

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

    function send_challenge_callback(data: string){
        const { success, invitee }: ChallengeCallbackData = JSON.parse(data);
        if(success === false){
            toast({
                variant: "destructive",
                title: "Challenge not accepted!",
                description: `${invitee} is currently offline!`
            })
        }
    }

    useEffect(()=>{
        if(status === "authenticated"){
            //@ts-ignore
            SignallingManager.get_instance(session.data.username);
            SignallingManager.get_instance().REGISTER_CALLBACK("INVITE",recieve_challenge_callbacks);
            SignallingManager.get_instance().REGISTER_CALLBACK("CHALLENGE", send_challenge_callback)
        }

        return ()=>{
            if(status === "authenticated"){
                //@ts-ignore
                SignallingManager.get_instance(session.data.username).DEREGISTER_CALLBACK("INVITE");
                SignallingManager.get_instance().DEREGISTER_CALLBACK("CHALLENGE");
            }
        }
    },[status])

    return(
        <></>
    )
}