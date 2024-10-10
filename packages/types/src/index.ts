import { z } from "zod";
import type WebSocket from "ws";

// -- zod schemas ---

export const match_result_schema = z.enum(["LOST","WON","DRAW","NOT_DECIDED_YET"]);

export const color_schema = z.enum(["w","b"]);

export const game_status_schema = z.enum([
    "NOT_STARTED",
    "ABONDONED",
    "ENDED",
    "IN_PROGRESS",
    "TIMED_OUT",
    "PLAYER_EXIT"
]);

export const move_popped_data_schema = z.object({
    gameId: z.string(),
    move: z.string(),
    beforeState: z.string(),
    afterState: z.string(),
    playerId: z.string(),
    playedAt: z.string().datetime({offset: true}),
    desc: z.string().nullish(),
});

export const player_popped_data_schema = z.object({
    color: color_schema,
    userId: z.string(),
    gameId: z.string(),
    finishedGame: z.boolean(),
    result: match_result_schema,
    gameToken: z.string(),
});

export const game_popped_data_schema = z.object({
    uid: z.string(),
    createdAt: z.string().datetime({ offset: true}),
    startedAt: z.string().datetime({offset: true}).optional(),
    plays: z.array(z.string()),
    currentState: z.string(),
    status: game_status_schema,
    metadata: z.record(z.string()).optional(),
});

export const redis_queue_payload_schema = z.discriminatedUnion("type",[
    z.object({
        type: z.literal("Move"),
        data: move_popped_data_schema,
    }),
    z.object({
        type: z.literal("Player"),
        data: player_popped_data_schema
    }),
    z.object({
        type: z.literal("Game"),
        data: game_popped_data_schema,
    }),
]);

export const user_signup_form_schema = z.object({
    username: z.string({required_error:"Username is a required field"}).min(6,{
        message: "Username should be atleast 6 digits",
    }),
    email: z.string({required_error: "Email is a required field"})
        .email({message: "Invalid email address"}),
    password: z.string()
        .min(10,{message: "Password should be between 10-12 characters"})
        .max(12,{message: "Can not be more than 12 characters"})
});

export const user_signin_form_schema = z.object({
    email: z.string().email({message: "Invalid email address"}),
    password: z.string()
    .min(10, { message: "Password should be between 10-12 characters" })
    .max(12, { message: "Can not be more than 12 characters "})
})

// ---- types ----

export type Client = {
    ws: WebSocket,
    id: string,
    user_id: string,
    color?: "b"| "w"
};

export type Color = "white" | "black";

export type RedisQueuePayload = z.output<typeof redis_queue_payload_schema>;

export type GameStartCallbackData = {
    game_id: string,
    fen: string,
    w: {
        pid: string,
        uid: string,
    },
    b: {
        pid: string,
        uid: string,
    }
}

export type LiveGameState = {
    game_id: string,
    player_id: string,
    fen: string,
    plays: string[],
    status: "NOT_STARTED" | "IN_PROGRESS",
    color: "w" | "b",
    opponent: {
        username: string,
        rating: string,
    },
}
