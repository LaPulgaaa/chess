import { atomFamily, selectorFamily } from "recoil";

import { LiveGameState } from "@repo/types";

export const live_games_store = atomFamily<LiveGameState[] | null, {user_id: string}>({
    key: "games_store",
    default: selectorFamily({
        key: "get_games",
        get: 
        ({ user_id }:{ user_id: string }) => 
            async ({get}) => {
                try{
                    const resp = await fetch(`/api/player/${user_id}`,{
                        cache: "no-store"
                    });
                    const {data}:{data:LiveGameState[]} = await resp.json();
                    return data;
                }catch(err){
                    console.log(err);
                    return null;
                }
            }
    })
});
