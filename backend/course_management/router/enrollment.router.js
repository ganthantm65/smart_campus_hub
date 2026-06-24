import { Router } from "express";
import { validateToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import enrollmentController from "../controller/enrollment.controller.js";

const enrollmentRouter = Router();

enrollmentRouter.post(
    "/enroll",
    validateToken,
    checkRole("ADMIN", "FACULTY"),
    enrollmentController.enrollStudentsToCourse
);

enrollmentRouter.post(
    "/bulk-enroll",
    validateToken,
    checkRole("ADMIN", "FACULTY"),
    enrollmentController.bulkEnrollDepartmentStudents
);

enrollmentRouter.get(
    "/department/:department",
    validateToken,
    checkRole("ADMIN", "FACULTY"),
    enrollmentController.getEnrollmentsByDepartment
);

enrollmentRouter.get(
    "/student/:studentId",
    validateToken,
    checkRole("ADMIN", "FACULTY", "STUDENT"),
    enrollmentController.getStudentCourses
);

enrollmentRouter.get(
    "/course/:courseId",
    validateToken,
    checkRole("ADMIN", "FACULTY"),
    enrollmentController.getCourseStudents
);

enrollmentRouter.get(
    "/current-semester/:studentId",
    validateToken,
    checkRole("ADMIN", "FACULTY", "STUDENT"),
    enrollmentController.getCurrentSemesterCourses
);

enrollmentRouter.get(
    "/count/:studentId",
    validateToken,
    checkRole("ADMIN", "FACULTY", "STUDENT"),
    enrollmentController.getStudentCourseCount
);

enrollmentRouter.get(
    "/check/:studentId/:courseId",
    validateToken,
    checkRole("ADMIN", "FACULTY", "STUDENT"),
    enrollmentController.isStudentEnrolled
);

enrollmentRouter.get(
    "/:enrollmentId",
    validateToken,
    checkRole("ADMIN", "FACULTY"),
    enrollmentController.getEnrollmentById
);

enrollmentRouter.delete(
    "/:enrollmentId",
    validateToken,
    checkRole("ADMIN"),
    enrollmentController.unenrollStudent
);

enrollmentRouter.delete(
    "/department/:department/:semester",
    validateToken,
    checkRole("ADMIN"),
    enrollmentController.unenrollStudentsByDepartmentAndSemester
);

export default enrollmentRouter;