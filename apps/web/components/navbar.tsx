import Link from "next/link";

import { ModeToggle, Button } from "@repo/ui";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export default function Navbar(){
    return (
        <header className="sticky top-0 z-full w-full backdrop-blur">
            <div className="container flex justify-between h-14 max-w-screen-2xl items-center">
                <div className="mr-4 flex">
                    <Link 
                    className="mr-4 flex items-center space-x-2 lg:mr-6"
                    href="/">
                        <span className="hidden lg:inline-block font-bold">play/Chess</span>
                    </Link>
                </div>
                <div className="flex">
                    <ModeToggle/>
                    <a
                    className="mx-2"
                    href="https://github.com/LaPulgaaa/chess">
                        <Button variant={"ghost"} size={"icon"}>
                            <GitHubLogoIcon/>
                        </Button>
                    </a>
                </div>
            </div>
        </header>
    )
}