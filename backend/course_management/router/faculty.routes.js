import { Router } from "express";

import { validateToken }
from "../middleware/authMiddleware.js";

import { checkRole }
from "../middleware/roleMiddleware.js";

import facultyController from "../controller/faculty.controller.js";

const facultyRouter = Router();

facultyRouter.post(
    "/assign",
    validateToken,
    checkRole("ADMIN"),
    facultyController.assignFacultyToCourse
);

facultyRouter.get(
    "/:mappingId",
    validateToken,
    checkRole("ADMIN", "FACULTY"),
    facultyController.getMappingById
);

facultyRouter.put(
    "/:mappingId",
    validateToken,
    checkRole("ADMIN"),
    facultyController.updateMapping
);

facultyRouter.delete(
    "/:mappingId",
    validateToken,
    checkRole("ADMIN"),
    facultyController.deleteMapping
);

facultyRouter.get(
    "/faculty/:facultyId",
    validateToken,
    checkRole("ADMIN", "FACULTY"),
    facultyController.getFacultyCourses
);

facultyRouter.get(
    "/faculty/:facultyId/current",
    validateToken,
    checkRole("ADMIN", "FACULTY"),
    facultyController.getCurrentSemesterCourses
);

facultyRouter.get(
    "/course/:courseId",
    validateToken,
    checkRole("ADMIN", "FACULTY", "STUDENT"),
    facultyController.getFacultyByCourse
);

export default facultyRouter;