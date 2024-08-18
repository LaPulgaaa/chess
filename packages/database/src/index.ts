import { PrismaClient } from "@prisma/client";

const prisma_singleton = () => {
    return new PrismaClient();
}

declare const globalThis : {
    prismaGlobal: ReturnType<typeof prisma_singleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prisma_singleton();

export default prisma;

if(process.env.NODE_ENV !== "production")
    globalThis.prismaGlobal = prisma;

