import express from 'express';
import { connectRedis } from './util/redis.js';

import courseRouter from './router/course.routes.js'
import enrollmentRouter from './router/enrollment.router.js';

const app=express();

connectRedis();

app.use(express.json())
app.use("/courses",courseRouter)
app.use("/enrollment",enrollmentRouter)

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        service: "Course Management Service",
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

const PORT = process.env.PORT || 8003;

app.listen(PORT, () => {
    console.log(
        `Course Management Service running on port ${PORT}`
    );
});