import Image from "next/image";

import { 
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle, 
    ToggleGroup,
    ToggleGroupItem
} from "@repo/ui";

import wk from "@/public/wk.png";
import bk from "@/public/bk.png";
import { QuestionMarkIcon } from "@radix-ui/react-icons";
import { useState } from "react";

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

    function send_request(){
        console.log(color);
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
                    <Button
                    onClick={send_request}
                    className="w-full" size={"lg"}>
                        Play
                    </Button>
                </div>
            </div>
        </span>
    )
}