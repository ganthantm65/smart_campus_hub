import facultyService from "../service/faculty.service.js";

class FacultyCourseMappingController {

    async assignFacultyToCourse(req, res) {
        try {

            const result =
                await facultyService
                    .assignFacultyToCourse(req.body);

            const status =
                result.success ? 201 : 400;

            return res.status(status).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    }

    async getMappingById(req, res) {
        try {

            const { mappingId } = req.params;

            const result =
                await facultyService
                    .getMappingById(mappingId);

            const status =
                result.success ? 200 : 404;

            return res.status(status).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    }

    async updateMapping(req, res) {
        try {

            const { mappingId } = req.params;

            const result =
                await facultyService
                    .updateMapping(
                        mappingId,
                        req.body
                    );

            const status =
                result.success ? 200 : 400;

            return res.status(status).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    }

    async deleteMapping(req, res) {
        try {

            const { mappingId } = req.params;

            const result =
                await facultyService
                    .deleteMapping(mappingId);

            const status =
                result.success ? 200 : 404;

            return res.status(status).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    }

    async getFacultyCourses(req, res) {
        try {

            const { facultyId } = req.params;

            const result =
                await facultyService
                    .getFacultyCourses(facultyId);

            return res.status(200).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    }

    async getCurrentSemesterCourses(req, res) {
        try {

            const { facultyId } = req.params;

            const result =
                await facultyService
                    .getCurrentSemesterCourses(
                        facultyId
                    );

            return res.status(200).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    }

    async getFacultyByCourse(req, res) {
        try {

            const { courseId } = req.params;

            const result =
                await facultyService
                    .getFacultyByCourse(courseId);

            const status =
                result.success ? 200 : 404;

            return res.status(status).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    }
}

export default new FacultyCourseMappingController();