import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Connect to Redis using the URL from environment variables
const redis = new Redis(process.env.UPSTASH_REDIS_URL);
export default redis;
