import express from 'express'; 
import dotenv from 'dotenv'; // 1. Import dotenv
import router from './router/auth.route.js';
import { connectRedis } from './db/redis.js';
import cors from 'cors'

dotenv.config(); // 2. Initialize it before anything else runs

connectRedis();

const app = express();
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", router);

app.listen(
    8001, () => {
        console.log("Authentication Service running on port 8001");
    }
);