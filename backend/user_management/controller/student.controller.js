import studentService from "../service/student.service.js";

class StudentController {

    async createStudent(req, res) {
        try {
            const student = await studentService.createStudent(req.body);
            return res.status(201).json({
                success: true,
                message: "Student profile created successfully",
                data: student
            });
        } catch (error) {
            if (error.message === "User not found" || error.message === "Student profile already exists") {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            console.error("Create Student Error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

    async getStudentById(req, res) {
        try {
            const result = await studentService.getStudentById(req.params.id);
            return res.status(200).json({
                success: true,
                source: result.source,
                data: result.data
            });
        } catch (error) {
            if (error.message === "Student not found") {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            console.error("Get Student Error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

    async getMyProfile(req, res) {
        try {
            const profile = await studentService.getMyProfile(req.userId);
            return res.status(200).json({
                success: true,
                data: profile
            });
        } catch (error) {
            if (error.message === "Profile not found") {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            console.error("Get Profile Error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

    async updateStudent(req, res) {
        try {
            const updatedStudent = await studentService.updateStudent(req.params.id,req.body);
            return res.status(200).json({
                success: true,
                message: "Student updated successfully",
                data: updatedStudent
            });
        } catch (error) {
            if (error.message === "Student not found") {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            console.error("Update Student Error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

    async deleteStudent(req, res) {
        try {
            const result = await studentService.deleteStudent(
                req.params.id
            );
            return res.status(200).json(result);
        } catch (error) {
            if (error.message === "Student not found") {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            console.error("Delete Student Error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

    async getAllStudents(req, res) {
        try {

            const students = await studentService.getAllStudents();

            return res.status(200).json({
                success: true,
                count: students.length,
                data: students
            });

        } catch (error) {

            console.error("Get All Students Error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });

        }
    }
    async searchStudents(req, res) {

        try {

            const { keyword } = req.query;

            if (!keyword) {

                return res.status(400).json({
                    success: false,
                    message: "Keyword is required"
                });

            }

            const students = await studentService.searchStudents(keyword);

            return res.status(200).json({
                success: true,
                count: students.length,
                data: students
            });

        } catch (error) {

            console.error("Search Student Error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });

        }
    }
    async getStudentsByDepartment(req, res) {

        try {

            const { department } = req.params;

            const students =
                await studentService.getStudentsByDepartment(department);

            return res.status(200).json({
                success: true,
                count: students.length,
                data: students
            });

        } catch (error) {

            console.error("Department Students Error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });

        }
    }

    async getStudentsBySemester(req, res) {

        try {

            const semester = parseInt(req.params.semester);

            const students =
                await studentService.getStudentsBySemester(semester);

            return res.status(200).json({
                success: true,
                count: students.length,
                data: students
            });

        } catch (error) {

            console.error("Semester Students Error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });

        }
    }
}

export default new StudentController();