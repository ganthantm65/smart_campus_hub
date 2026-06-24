import { Router } from "express";
import { validateToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import courseController from "../controller/course.controller.js";

const courseRouter = Router();

courseRouter.post(
    "/create",
    validateToken,
    checkRole("ADMIN"),
    courseController.createCourse
);

courseRouter.get(
    "/:id",
    validateToken,
    checkRole("ADMIN", "FACULTY", "STUDENT"),
    courseController.getCourseById
);

courseRouter.get(
    "/code/:code",
    validateToken,
    checkRole("ADMIN", "FACULTY", "STUDENT"),
    courseController.getByCourseCode
);

courseRouter.get(
    "/search/:name",
    validateToken,
    checkRole("ADMIN", "FACULTY", "STUDENT"),
    courseController.getByCourseName
);

courseRouter.get(
    "/department/:department",
    validateToken,
    checkRole("ADMIN", "FACULTY", "STUDENT"),
    courseController.getByDepartment
);

courseRouter.put(
    "/:id",
    validateToken,
    checkRole("ADMIN"),
    courseController.updateCourse
);

courseRouter.delete(
    "/:id",
    validateToken,
    checkRole("ADMIN"),
    courseController.deleteCourse
);

courseRouter.get(
    "/all",
    validateToken,
    checkRole("ADMIN"),
    courseController.getAllCourse
)

courseRouter.get(
    "/:department/:semester",
    validateToken,
    checkRole("ADMIN","FACULTY","STUDENT"),
    courseController.getCourseByDepartmentandSemester
)

courseRouter.get(
    "/:semester",
    validateToken,
    checkRole("ADMIN","FACULTY","STUDENT"),
    courseController.getCourseBySemester
)

export default courseRouter;