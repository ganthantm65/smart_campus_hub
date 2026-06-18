import express from 'express'

import router from './router/student.router.js';

import { connectRedis } from './util/redis';

const app=express()

connectRedis();

app.use(express.json())
app.use("/students",router)

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        service: "User Management Service",
        status: "UP"
    });
});

app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
});

const PORT = process.env.PORT || 8002;

app.listen(PORT, () => {
    console.log(
        `User Management Service running on port ${PORT}`
    );
});