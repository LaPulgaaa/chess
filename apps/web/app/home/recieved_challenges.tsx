'use client'

import { SignallingManager } from "@/lib/singleton/signal_manager";
import { CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import { ChallengeRecieved, challenges } from "@repo/store"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui";
import { Badge } from "@repo/ui";
import { Button } from "@repo/ui";
import { useSession } from "next-auth/react";
import { useRecoilState } from "recoil"

export default function RecievedChallenge({ variant }:{ variant: "RANDOM_INVITE" | "FRIEND_INVITE" }){
    const session = useSession();
    const [recieved_challenges,setRecieved_Challenges] = useRecoilState(challenges);

    function refuse_challenge(toremove_gid: string){
        const left_challenges = recieved_challenges.filter((c)=>c.game_id !== toremove_gid);
        setRecieved_Challenges([...left_challenges]);
    }

    function accept_challenge(challenge: ChallengeRecieved){

        if(session.status === "authenticated"){
            const left_challenges = recieved_challenges.filter((c)=>c.game_id !== challenge.game_id);
            setRecieved_Challenges([...left_challenges]);
            const message = JSON.stringify({
                type: "CHALLENGE",
                payload: {
                    game_id: challenge.game_id,
                    accept: true,
                    host: {
                        uid: challenge.host_uid,
                        color:challenge.host_color === "b" ? "b" : "w"
                    },
                    invitee: {
                        //@ts-ignore
                        uid: session.data.username,
                        color: challenge.host_color === "b" ? "w" : "b"
                    }
                }
            })
            SignallingManager.get_instance().CHALLENGE(message);
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
                        if(challenge.variant === variant)
                        return (
                            <div 
                            key={challenge.game_id}
                            className="flex space-x-2 justify-between">
                                <div className="flex space-x-2">
                                    <Avatar className="rounded-none">
                                        <AvatarImage
                                        className="rounded-none"
                                        src={challenge.host_avatar ?? ""}/>
                                        <AvatarFallback
                                        className="rounded-none"
                                        >{challenge.host_uid.substring(0,2)}</AvatarFallback>
                                    </Avatar>
                                    <p className="mt-2">{challenge.host_uid}</p>
                                </div>
                                <div className="flex justify-between space-x-2">
                                    <Button 
                                    onClick={()=>accept_challenge(challenge)}
                                    className = {`${challenge.host_color === "w" ? "bg-black text-white": "bg-white text-black"}`}
                                    variant={"outline"} size={"icon"}><CheckIcon/></Button>
                                    <Button 
                                    onClick={()=>refuse_challenge(challenge.game_id)}
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