'use client'

import { useEffect, useState } from "react";

import { SignallingManager } from "@/lib/singleton/signal_manager";
import { CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import { challenges } from "@repo/store";
import { ChallengeRecieved } from "@repo/types";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui";
import { Badge } from "@repo/ui";
import { Button } from "@repo/ui";
import { useSession } from "next-auth/react";

export default function RecievedChallenge(){
    const session = useSession();
    const [recieved_challenges,setRecieved_Challenges] = useState<ChallengeRecieved[]>([]);

    useEffect(()=>{
        const fetch_challenges = async() => {
            try{
                const resp = await fetch("/api/challenge",{
                    credentials: "include",
                });
                const { data } = await resp.json();
                setRecieved_Challenges(data);
            }catch(err){
                console.log(err);
            }
        }

        fetch_challenges();
    },[])

    function refuse_challenge(toremove_gid: string){
        const left_challenges = recieved_challenges.filter((c) => c.gameId !== toremove_gid);
        setRecieved_Challenges([...left_challenges]);
    }

    function accept_challenge(challenge: ChallengeRecieved){

        if(session.status === "authenticated"){
            const left_challenges = recieved_challenges.filter((c) => c.gameId !== challenge.gameId);
            setRecieved_Challenges([...left_challenges]);
            const message = JSON.stringify({
                type: "CHALLENGE",
                payload: {
                    game_id: challenge.gameId,
                    accept: true,
                    host: {
                        uid: challenge.hostUser.username,
                        color:challenge.hostColor === "b" ? "b" : "w"
                    },
                    invitee: {
                        //@ts-ignore
                        uid: session.data.username,
                        color: challenge.hostColor === "b" ? "w" : "b"
                    }
                }
            })
            SignallingManager.get_instance().HANDLE_MESSAGE(message);
        }
        else{
            alert("Not verified");
        }
    }


    return(
        <div className="w-full px-6 mt-4">
            <div className="flex">
                <p>Challenges</p>
                <Badge className="ml-1" variant={"secondary"}>{recieved_challenges?.length ?? 0}</Badge>
            </div>
            <div className="space-y-2 mt-2">
                {
                    recieved_challenges ? recieved_challenges.map((challenge)=>{
                        return (
                            <div 
                            key={challenge.gameId}
                            className="flex space-x-2 justify-between">
                                <div className="flex space-x-2">
                                    <Avatar className="rounded-none">
                                        <AvatarImage
                                        className="rounded-none"
                                        src={challenge.hostUser.avatar ?? ""}/>
                                        <AvatarFallback
                                        className="rounded-none"
                                        >{challenge.hostUser.username.substring(0,2)}</AvatarFallback>
                                    </Avatar>
                                    <p className="mt-2">{challenge.hostUser.username}</p>
                                </div>
                                <div className="flex justify-between space-x-2">
                                    <Button 
                                    onClick={()=>accept_challenge(challenge)}
                                    className = {`${challenge.hostColor === "w" ? "bg-black text-white": "bg-white text-black"}`}
                                    variant={"outline"} size={"icon"}><CheckIcon/></Button>
                                    <Button 
                                    onClick={()=>refuse_challenge(challenge.gameId)}
                                    variant={"destructive"} size={"icon"}><Cross1Icon/></Button>
                                </div>
                            </div>
                        )
                    }) : <></>
                }
            </div>
        </div>
    )
}