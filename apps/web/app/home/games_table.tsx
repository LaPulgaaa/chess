import { GameStatus } from "@repo/types";
import { 
    Table,
    TableCaption,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@repo/ui";

export type Match = {
    uid: string,
    createdAt: Date;
    moves: {
        move: string,
    }[];
    status: GameStatus
    players: {
        result: "WON" | "LOST" | "DRAW" | "NOT_DECIDED_YET";
        color: "w" | "b";
        user: {
            username: string;
            rating: number;
            avatar: string | null;
        };
    }[];
}

export default function GamesTable({matches}:{matches:Match[]}){
    return (
        <div>
            <Table className="rounded-md border-2">
                    <TableCaption>
                        A list of matches played.
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Players</TableHead>
                            <TableHead>Result</TableHead>
                            <TableHead>Moves</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            matches.map((match) => {
                                return(
                                    <TableRow
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
                                            {
                                                match.players.map((player) => {
                                                    return(
                                                        <p key={player.user.username}>{player.result === "WON" ? "1" : "0"}</p>
                                                    )
                                                })
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {match.moves.length}
                                        </TableCell>
                                        <TableCell>
                                            {match.createdAt.toLocaleString()}
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