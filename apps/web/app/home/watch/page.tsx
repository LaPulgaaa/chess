'use server'

import { getServerSession } from "next-auth";
import { get_top_live_games } from "./actions";
import type {LiveGametoWatch} from "./actions";
import LiveGamesTable from "./live_games_table";

export default async function Watch(){
    const session = await getServerSession();
    const live_games:LiveGametoWatch[] = await get_top_live_games(session?.user?.email);
    return (
        <div>
            <LiveGamesTable matches={live_games}/>
        </div>
    )
}