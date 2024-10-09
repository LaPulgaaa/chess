import { atomFamily, selectorFamily } from "recoil";

import { LiveGameState } from "@repo/types";

export const live_games_store = atomFamily<LiveGameState[] | null, {username: string}>({
    key: "games_store",
    default: selectorFamily({
        key: "get_games",
        get: 
        ({ username }:{ username: string }) => 
            async ({get}) => {
                try{
                    const resp = await fetch(`/api/player/live/${username}`,{
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

export const get_game_from_id = selectorFamily<LiveGameState | null, {username: string | undefined, game_id: string}>({
    key: "get_game_from_id",
    get: ({username, game_id}:{username: string | undefined, game_id: string}) =>
        ({get}) => {
            if(username === undefined)
                return null;
            
            const all_live_games = get(live_games_store({username}));

            const possible_live_game = all_live_games?.find((game) => game.game_id === game_id);

            if(possible_live_game !== undefined)
                return possible_live_game;

            return null;
        }
})