import { atom } from "recoil";

export const board_orien = atom<"w" | "b">({
    key: "board_state",
    default: "w"
})