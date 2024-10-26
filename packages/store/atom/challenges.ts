import { atom } from "recoil";

export type ChallengeRecieved = {
    host_uid: string,
    host_color: "w" | "b",
    host_avatar: string,
    game_id: string,
    variant: "FRIEND_INVITE" | "RANDOM_INVITE",
}

export const challenges = atom<ChallengeRecieved[]>({
    key: "challenges",
    default: [],
});