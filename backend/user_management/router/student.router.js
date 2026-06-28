import express from "express";
import studentController from "../controller/student.controller.js";
import { validateToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

/* Create Student */
router.post(
    "/",
    validateToken,
    checkRole("ADMIN"),
    studentController.createStudent
);

/* Logged in student profile */
router.get(
    "/me",
    validateToken,
    checkRole("STUDENT"),
    studentController.getMyProfile
);

/* Get all students */
router.get(
    "/",
    validateToken,
    checkRole("ADMIN", "FACULTY"),
    studentController.getAllStudents
);

/* Search students */
router.get(
    "/search",
    validateToken,
    checkRole("ADMIN", "FACULTY"),
    studentController.searchStudents
);

/* Students by department */
router.get(
    "/department/:department",
    validateToken,
    checkRole("ADMIN", "FACULTY"),
    studentController.getStudentsByDepartment
);

/* Students by semester */
router.get(
    "/semester/:semester",
    validateToken,
    checkRole("ADMIN", "FACULTY"),
    studentController.getStudentsBySemester
);

/* Student by id */
router.get(
    "/:id",
    validateToken,
    checkRole("ADMIN", "FACULTY", "STUDENT"),
    studentController.getStudentById
);

/* Update */
router.put(
    "/:id",
    validateToken,
    checkRole("ADMIN", "STUDENT"),
    studentController.updateStudent
);

/* Delete */
router.delete(
    "/:id",
    validateToken,
    checkRole("ADMIN"),
    studentController.deleteStudent
);

export default router;