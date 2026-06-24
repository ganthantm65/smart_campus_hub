import courseService from "../service/course.service.js";

class CourseController {

    async createCourse(req, res) {
        try {
            const result = await courseService.createCourse(req.body);

            return res.status(result.success ? 201 : 400).json(result);

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getCourseById(req, res) {
        try {

            const { id } = req.params;

            const result = await courseService.getCourseById(id);

            return res.status(result.success ? 200 : 404).json(result);

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getByCourseCode(req, res) {
        try {

            const { code } = req.params;

            const result = await courseService.getByCourseCode(code);

            return res.status(200).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getByCourseName(req, res) {
        try {

            const { name } = req.params;

            const result = await courseService.getByCourseName(name);

            return res.status(200).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getByDepartment(req, res) {
        try {

            const { department } = req.params;

            const result = await courseService.getByDepartment(department);

            return res.status(200).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateCourse(req, res) {
        try {

            const { id } = req.params;

            const result = await courseService.updateCourse(
                id,
                req.body
            );

            return res.status(
                result.success ? 200 : 404
            ).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteCourse(req, res) {
        try {

            const { id } = req.params;

            const result = await courseService.deleteCourse(id);

            return res.status(
                result.success ? 200 : 404
            ).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAllCourse(req,res){
        try{
            const result=await courseService.getAllCourses();
            return res.status(
                result.success ? 200 : 404
            ).json(result);

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getCourseBySemester(req,res){
        try {
            const {semester}=req.params;

            const result=await courseService.getCoursesBySemester(semester);

            return res.status(
                result.success ? 200 : 404
            ).json(result);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async getCourseByDepartmentandSemester(req,res){
        try{
            const {department,semester}=req.params;

            const result=await courseService.getCoursesByDepartmentAndSemester(department,semester);
            return res.status(
                result.success ? 200 : 404
            ).json(result);
        } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message
                });
        }
    }
}

export default new CourseController();