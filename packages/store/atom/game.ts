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

export const get_game_from_id = selectorFamily<LiveGameState | null, { game_id: string}>({
    key: "get_game_from_id",
    get: ({game_id}:{game_id: string}) =>
        ({get}) => {
            
            const all_live_games = get(live_games_store);

            const possible_live_game = all_live_games?.find((game) => game.game_id === game_id);

            if(possible_live_game !== undefined)
                return possible_live_game;

            return null;
        }
})