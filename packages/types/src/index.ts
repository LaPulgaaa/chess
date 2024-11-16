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
    player_id: z.string(),
    game_id: z.string(),
    from: z.string(),
    to: z.string(),
    prev_fen: z.string(),
});

export const update_game_status_popped_data_schema = z.object({
    game_id: z.string(),
    status: z.discriminatedUnion("updated_status",[
        z.object({
            updated_status: z.literal("ENDED"),
            winner: z.object({
                color: color_schema,
                player_id: z.string(),
            }),
            ended_at: z.string(),
        }),
        z.object({
            updated_status: z.literal("IN_PROGRESS"),
            started_at: z.string(),
        }),
        z.object({
            updated_status: z.literal("DREW"),
            ended_at: z.string(),
        })
    ])

})

export const redis_queue_payload_schema = z.discriminatedUnion("type",[
    z.object({
        type: z.literal("MOVE"),
        data: move_popped_data_schema,
    }),
    z.object({
        type: z.literal("GAME_STATUS"),
        data: update_game_status_popped_data_schema,
    })
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

export type GameStatus = z.output<typeof game_status_schema>;

export const live_game_details_schema = z.object({
    game_id: z.string(),
    player_id: z.string(),
    fen: z.string(),
    plays: z.array(z.string()),
    status: z.enum(["NOT_STARTED","IN_PROGRESS"]),
    color: z.enum(["w","b"]),
    opponent: z.object({
        username: z.string(),
        rating: z.number(),
    })
});

export type LiveGameState = z.output<typeof live_game_details_schema>;

export const player_data = z.object({
    user: z.object({
        username: z.string(),
        rating: z.number(),
    }),
    color: color_schema,
});

export const game_broadcast_init_game_schema = z.object({
    currentState: z.string(),
    moves: z.array(z.object({
        move: z.string(),
    })),
    players: z.array(player_data),
})

export type ChallengeRecieved = {
    host_uid: string,
    host_color: "w" | "b",
    host_avatar: string,
    game_id: string,
    variant: "FRIEND_INVITE" | "RANDOM_INVITE",
}