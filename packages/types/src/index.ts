import { z } from "zod";
import type WebSocket from "ws";

// -- zod schemas ---

export const redis_queue_payload_schema = z.object({
    type: z.enum(["User","Player","Game","Move"]),
    data: z.unknown(),
});

// ---- types ----

export type Client = {
    ws: WebSocket,
    id: string,
    user_id: string,
    color?: "black"| "white"
}

export type Color = "white" | "black";
