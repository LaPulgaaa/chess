'use client'

import Image from "next/image";

import { QuestionMarkIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSession } from "next-auth/react";

import { 
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    toast, 
} from "@repo/ui";

import wk from "@/public/wk.png";
import bk from "@/public/bk.png";

import { SignallingManager } from "@/lib/singleton/signal_manager";
import type { InviteMessage } from "@/lib/singleton/signal_manager";


type Profile = {
    username: string;
    name: string | null;
    rating: number;
    email: string;
    avatar: string | null;
    createdAt: Date;
};

export default function Profile(profile:Profile){
    const [color, setColor] = useState<"w" | "b" | "r">("w");
    const session = useSession();

    function send_request(invitee: string){
        if(session.status === "authenticated"){
            const game_id = uuidv4();
            const data:InviteMessage = {
                game_id,
                invitee_uid: invitee,
                //@ts-ignore
                host_uid: session.data.username,
                host_color: color,
                host_avatar: "",
            };
            //@ts-ignore
            SignallingManager.get_instance(session.data.username).INVITE(data);
        }
        
    }

    return (
        <span>
            <DialogHeader>
                <DialogTitle>Play vs</DialogTitle>
                <DialogDescription>Challenge your friend to a game</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4 mt-4 mx-2">
                <Avatar className="h-[100px] w-[100px]">
                    <AvatarImage src={profile.avatar ?? ""} />
                    <AvatarFallback>{profile.username.substring(0,2)}</AvatarFallback>
                </Avatar>
                <div>
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    {profile.username}
                </h3>
                </div>
                <div className="w-full flex justify-between m-2">
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                    I play as 
                </h4>
                <div className="flex justify-around space-x-3">
                    <Button
                    className = {`${color === "w" ? "border-2 border-rose-900" : ""} p-1`}
                    onClick={() => setColor("w")}
                    size={"icon"}>
                        <Image
                        src={wk}
                        alt="white"
                        />
                    </Button>
                    <Button
                    className = {`${color === "b" ? "border-2 border-rose-900" : ""} p-1`}
                    onClick={()=> setColor("b")}
                    size={"icon"}>
                        <Image
                        src={bk}
                        alt="white"
                        />
                    </Button>
                    <Button 
                    className = {`${color === "r" ? "border-2 border-rose-900" : ""} p-1`}
                    onClick={()=> setColor("r")}
                    size={"icon"}>
                        <QuestionMarkIcon/>
                    </Button>
                </div>
                </div>
                <div className="w-full">
                    <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button
                            onClick={()=>send_request(profile.username)}
                            className="w-full" size={"lg"}>
                                Play
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </div>
            </div>
        </span>
    )
}