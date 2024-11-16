import { atom } from "recoil";

export type ChallengeRecieved = {
    hostColor: "w" | "b",
    gameId: string,
    variant: "FRIEND_INVITE" | "RANDOM_INVITE",
    hostUser: {
        username: string,
        avatar: string | null,
    }
}

export const challenges = atom<ChallengeRecieved[]>({
    key: "challenges",
    default: [],
});