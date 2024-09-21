'use client'

import { SignallingManager } from "@/lib/singleton/signal_manager";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Connect(){
    const session = useSession();

    const status = session.status;

    useEffect(()=>{
        if(status === "authenticated"){
            //@ts-ignore
            SignallingManager.get_instance(session.data.username);
        }
    },[status])

    return(
        <></>
    )
}