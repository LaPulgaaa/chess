'use client'

import { Button } from "@repo/ui";
import { useEffect } from "react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string},
    reset: () => void
}) {
    useEffect(()=>{
        console.log(error);
    },[error])

    return(
        <div>
            <h2>Something wrong happened</h2>
            <Button
            onClick={() => {
                reset();
            }}
            >
                Try Again
            </Button>
        </div>
    )
}