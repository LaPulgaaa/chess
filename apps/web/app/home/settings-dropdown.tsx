'use client'

import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { 
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuGroup,
    DropdownMenuItem
} from "@repo/ui";
import { LogOut, Settings, User } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SettingsDropdown(){

    async function handle_signout(){
        await signOut({callbackUrl: "/"});
    }
    return(
        <DropdownMenu>
            <DropdownMenuTrigger><Settings/></DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <User />
                        <span className="ml-2">Profile</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator/>
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <GitHubLogoIcon />
                        <span className="ml-2">Github</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator/>
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={handle_signout}>
                        <LogOut/>
                        <span className="ml-2">Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}