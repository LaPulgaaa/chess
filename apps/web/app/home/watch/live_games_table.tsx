'use client'
import { 
    Table,
    TableCaption,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@repo/ui";

import { LiveGametoWatch } from "./actions";
import { useRouter } from "next/navigation";

export default function LiveGamesTable({matches}:{matches:LiveGametoWatch[]}){
    const router = useRouter();
    return (
        <div className="m-12">
            <Table className="rounded-md border-2">
                    <TableCaption>
                        A list of live games being played.
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Players</TableHead>
                            <TableHead>Moves</TableHead>
                            <TableHead>Started at</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            matches.map((match) => {
                                return(
                                    <TableRow
                                    className="cursor-pointer"
                                    onClick={() => {
                                        router.push(`/home/watch/game/${match.uid}`)
                                    }}
                                    key={match.uid}
                                    >
                                        <TableCell>
                                            <div className="flex flex-col space-y-2">
                                                {
                                                    match.players.map((player)=>{
                                                        return(
                                                            <div className="flex space-x-2">
                                                                <span 
                                                                className={`${player.color === "b" ? "bg-zinc-900" : "bg-gray-200"} w-[20px]`}></span>
                                                                <p>{player.user.username}</p>
                                                                <p className="text-muted-foreground">
                                                                    #{player.user.rating}
                                                                </p>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {match.moves.length}
                                        </TableCell>
                                        <TableCell>
                                            {match.createdAt?.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        }
                    </TableBody>
                </Table>
        </div>
    )
}