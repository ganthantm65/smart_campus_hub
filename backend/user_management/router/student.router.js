import express from "express";
import studentController from "../controller/student.controller.js";
import { validateToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/create",
    validateToken,
    checkRole("ADMIN"),
    studentController.createStudent
);

router.get(
    "/me",
    validateToken,
    checkRole("STUDENT"),
    studentController.getMyProfile
);

router.get(
    "/:id",
    validateToken,
    checkRole("ADMIN", "FACULTY"),
    studentController.getStudentById
);

router.put(
    "/:id",
    validateToken,
    checkRole("ADMIN", "STUDENT"),
    studentController.updateStudent
);

router.delete(
    "/:id",
    validateToken,
    checkRole("ADMIN"),
    studentController.deleteStudent
);

export default router;