import { Router } from "express";
import { validateToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import facultyController from "../controller/faculty.controller.js";

const facultyRouter = Router();

facultyRouter.post(
    "/create",
    validateToken,
    checkRole("ADMIN"),
    facultyController.createFaculty
);

facultyRouter.get(
    "/",
    validateToken,
    checkRole("ADMIN", "FACULTY", "STUDENT"),
    facultyController.getAllFaculty
);

facultyRouter.get(
    "/search/:name",
    validateToken,
    checkRole("ADMIN", "FACULTY", "STUDENT"),
    facultyController.getFacultyByName
);

facultyRouter.get(
    "/department/:department",
    validateToken,
    checkRole("ADMIN", "FACULTY", "STUDENT"),
    facultyController.getFacultyByDepartment
);

facultyRouter.get(
    "/:id",
    validateToken,
    checkRole("ADMIN", "FACULTY", "STUDENT"),
    facultyController.getFacultyById
);

facultyRouter.put(
    "/:id",
    validateToken,
    checkRole("ADMIN"),
    facultyController.updateFaculty
);

facultyRouter.delete(
    "/:id",
    validateToken,
    checkRole("ADMIN"),
    facultyController.deleteFaculty
);

export default facultyRouter;