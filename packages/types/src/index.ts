import { z } from "zod";
import type WebSocket from "ws";

// -- zod schemas ---

export const match_result_schema = z.enum(["LOST","WON","DRAW"]);

export const color_schema = z.enum(["WHITE","BLACK"]);

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

export const redis_queue_payload_schema = z.discriminatedUnion("type",[
    z.object({
        type: z.literal("Move"),
        data: move_popped_data_schema,
    }),
    z.object({
        type: z.literal("Player"),
        data: player_popped_data_schema
    })
]);

// ---- types ----

export type Client = {
    ws: WebSocket,
    id: string,
    user_id: string,
    color?: "black"| "white"
};

export type Color = "white" | "black";

export type RedisQueuePayload = z.output<typeof redis_queue_payload_schema>;
