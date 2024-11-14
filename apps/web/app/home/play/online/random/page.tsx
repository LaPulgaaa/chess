'use client'

import { useSession } from "next-auth/react";
import DummyBoard from "../dummy_board";
import { useEffect, useState } from "react";
import { SignallingManager } from "@/lib/singleton/signal_manager";
import { Button, useToast } from "@repo/ui";
import { Select, SelectContent, SelectValue, SelectTrigger, SelectItem } from "@repo/ui";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import RecievedChallenge from "@/app/home/recieved_challenges";

export default function Online(){

    const session = useSession();
    const { toast } = useToast();
    const [posDev,setPosDev] = useState("+20");
    const [negDev,setNegDev] = useState("-20");

    function send_play_random_request(){
        if(session.status === "authenticated"){
            //@ts-ignore
            const { avatarurl, rating, username } = session.data;
            const message = JSON.stringify({
                type: "PLAY_RANDOM",
                payload: {
                    host_avatar: avatarurl,
                    host_rating: rating,
                    host_uid: username,
                    deviation: Number.parseInt(posDev)-Number.parseInt(negDev),
                }
            })
            SignallingManager.get_instance().HANDLE_MESSAGE(message);
            toast({
                title: "Waiting for opponent"
            })
        }
    }

    useEffect(()=>{
        if(session.status === "authenticated"){
            //@ts-ignore
            const username: string = session.data.username;
            //@ts-ignore
            const rating: number = session.data.rating;
            const message = JSON.stringify({
                type: "ADD_AVAILABLE",
                payload: {
                    user_id: username,
                    rating,
                }
            })
            SignallingManager.get_instance(username).HANDLE_MESSAGE(message);
        }
        return () => {
            if(session.status === "authenticated"){
                //@ts-ignore
                const username: string = session.data.username;
                const message = JSON.stringify({
                    type: "REMOVE_AVAILABLE",
                    payload: {
                        user_id: username,
                    }
                });
                SignallingManager.get_instance(username).HANDLE_MESSAGE(message);
            }
        }
    },[session.status])
    
    return(
        <div  className="flex lg:flex-row flex-col items-center lg:justify-around m-12">
            <DummyBoard/>
            <div className="w-full h-full p-8 flex flex-col justify-center items-center dark:bg-zinc-900 bg-orange-100">
                <div className="w-full flex flex-col justify-center items-center space-y-4">
                <p>Rating Deviation</p>
                <div className="flex justify-between space-x-2 w-1/2">
                <Select
                onValueChange={(e)=>{
                    setNegDev(e)
                }}
                defaultValue={negDev}
                >
                    <SelectTrigger id="Amount">
                        <SelectValue placeholder="Amount"/>
                    </SelectTrigger>
                    <SelectContent >
                        <SelectItem value="-5">-5</SelectItem>
                        <SelectItem value="-10">-10</SelectItem>
                        <SelectItem value="-15">-15</SelectItem>
                        <SelectItem value="-20">-20</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex mt-3">
                    <DotsHorizontalIcon/>
                    <DotsHorizontalIcon/>
                </div>
                <Select
                onValueChange={(e)=>{
                    setPosDev(e)
                }}
                defaultValue={posDev}
                >
                    <SelectTrigger id="Amount">
                        <SelectValue placeholder="Amount"/>
                    </SelectTrigger>
                    <SelectContent >
                        <SelectItem value="+5">+5</SelectItem>
                        <SelectItem value="+10">+10</SelectItem>
                        <SelectItem value="+15">+15</SelectItem>
                        <SelectItem value="+20">+20</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                </div>
                <Button 
                onClick={send_play_random_request}
                size={"lg"} className="w-1/2 mt-4">PLAY</Button>
                {/* { session.status === "authenticated" && <RecievedChallenge/> } */}
            </div>
        </div>
    )
}