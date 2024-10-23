import { atom, selector, selectorFamily } from "recoil";

import { LiveGameState } from "@repo/types";

export const live_games_store = atom<LiveGameState[] | null>({
    key: "games_store",
    default: selector({
        key: "get_live_games",
        get: async() => {
            try{
                const resp = await fetch(`/api/player/live/`,{
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
