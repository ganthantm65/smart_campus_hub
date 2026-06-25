import enrollmentService from "../service/enrollment.service.js";

class EnrollmentController {

    async enrollStudentsToCourse(req, res) {
        try {

            const result =
                await enrollmentService.enrollStudentsToCourse(
                    req.body
                );

            return res.status(result.success?201:400).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getEnrollmentsByDepartment(req, res) {
        try {

            const { department } = req.params;

            const result =
                await enrollmentService.getEnrollmentsByDepartment(
                    department
                );

            return res.status(200).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getStudentCourses(req, res) {
        try {

            const { studentId } = req.params;

            const result =
                await enrollmentService.getStudentCourses(
                    studentId
                );

            return res.status(200).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getCourseStudents(req, res) {
        try {

            const { courseId } = req.params;

            const result =
                await enrollmentService.getCourseStudents(
                    courseId
                );

            return res.status(200).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async unenrollStudentsByDepartmentAndSemester(req, res) {
        try {

            const { department, semester } = req.params;

            const result =
                await enrollmentService
                    .unenrollStudentsByDepartmentAndSemester(
                        department,
                        semester
                    );

            return res.status(200).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async bulkEnrollDepartmentStudents(req, res) {
        try {

            const {
                courseId,
                department,
                semester
            } = req.body;

            const result =
                await enrollmentService
                    .bulkEnrollDepartmentStudents(
                        courseId,
                        department,
                        semester
                    );

            return res.status(200).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async unenrollStudent(req, res) {
        try {

            const { enrollmentId } = req.params;

            const result =
                await enrollmentService.unenrollStudent(
                    enrollmentId
                );

            return res.status(200).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getEnrollmentById(req, res) {
        try {

            const { enrollmentId } = req.params;

            const result =
                await enrollmentService.getEnrollmentById(
                    enrollmentId
                );

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

            const { studentId } = req.params;

            const result =
                await enrollmentService.getCurrentSemesterCourses(
                    studentId
                );

            return res.status(200).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async isStudentEnrolled(req, res) {
        try {

            const {
                studentId,
                courseId
            } = req.params;

            const result =
                await enrollmentService.isStudentEnrolled(
                    studentId,
                    courseId
                );

            return res.status(200).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getStudentCourseCount(req, res) {
        try {

            const { studentId } = req.params;

            const result =
                await enrollmentService.getStudentCourseCount(
                    studentId
                );

            return res.status(200).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

export default new EnrollmentController();