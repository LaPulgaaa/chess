import Link from "next/link";

import { ModeToggle } from "@repo/ui"

export default function Navbar(){
    return (
        <header className="sticky top-0 z-full w-full backdrop-blur">
            <div className="container flex justify-between h-14 max-w-screen-2xl items-center">
                <div className="mr-4 hidden md:flex">
                    <Link 
                    className="mr-4 flex items-center space-x-2 lg:mr-6"
                    href="/">
                        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">play/Chess</h4>
                    </Link>
                </div>
                <div className="flex ">
                    <ModeToggle/>
                </div>
            </div>
        </header>
    )
}