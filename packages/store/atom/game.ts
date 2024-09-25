import { atom } from "recoil";

export type GameState = {
    game_id: string,
    fen: string,
    color: "w" | "b"
}

export const game_state = atom<GameState | undefined>({
    key: "game_state",
    default: undefined
})
