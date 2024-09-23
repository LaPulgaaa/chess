import { atom } from "recoil";

type ChallengeRecieved = {
    host_uid: string,
    host_color: string,
    host_avatar: string,
    game_id: string,
}

export const challenges = atom<ChallengeRecieved[]>({
    key: "challenges",
    default: [],
});