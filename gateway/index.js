import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import limiter from "./middleware/rateLimiter.js";
import courseProxy from "./proxy/course.proxy.js";

dotenv.config();

const app = express();

// 1. ROUTE FIRST: Let proxy traffic bypass gateway body parsing entirely!
app.use("/auth", authRoutes);
app.use("/user_management", userRouter);
app.use("/course_management",courseProxy);

// 2. PARSE SECOND: This will now only apply to local gateway endpoints (if any)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Rate limiter (Note: standard rate limiters usually work on IP headers, 
// so placing it here handles non-proxied routes, or move it up if it doesn't parse req.body)
app.use(limiter);

app.listen(3000, () => {
    console.log("Gateway running on port 3000");
});