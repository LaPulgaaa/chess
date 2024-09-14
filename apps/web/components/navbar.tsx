import Link from "next/link";

import { ModeToggle, Button } from "@repo/ui";

export default function Navbar(){
    return (
        <div className="sticky top-0 z-full w-full backdrop-blur">
            <div className="container flex justify-between h-14 max-w-screen-2xl items-center mt-1">
                <div className="mr-4 flex">
                    <Link 
                    className="mr-4 flex items-center space-x-2 lg:mr-6"
                    href="/">
                        <span className="hidden italic lg:inline-block font-bold">play/ Chess</span>
                    </Link>
                </div>
                <div className="flex">
                    <ModeToggle/>
                </div>
            </div>
        </div>
    )
}