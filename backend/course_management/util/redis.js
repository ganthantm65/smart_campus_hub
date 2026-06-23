import { createClient } from "redis";

export const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.on("connect", () => {
    console.log("Redis connected");
});

redisClient.on("ready", () => {
    console.log("Redis ready");
});

redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
});

export const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log("Redis connection established");
    } catch (err) {
        console.error("Failed to connect Redis:", err);
    }
};