import facultyService from "../service/faculty.service.js";

class FacultyController {

    async createFaculty(req, res) {
        try {

            const result = await facultyService.createFaculty(req.body);

            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.status(201).json(result);

        } catch (error) {

            console.error("Create Faculty Error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

    async getFacultyById(req, res) {
        try {

            const { id } = req.params;

            const result = await facultyService.getFacultyById(id);

            if (!result.success) {
                return res.status(404).json(result);
            }

            return res.status(200).json(result);

        } catch (error) {

            console.error("Get Faculty Error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

    async getFacultyByName(req, res) {
        try {

            const { name } = req.params;

            const result = await facultyService.getFacultyByName(name);

            if (!result.success) {
                return res.status(404).json(result);
            }

            return res.status(200).json(result);

        } catch (error) {

            console.error("Search Faculty Error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

    async getAllFaculty(req, res) {
        try {

            const result = await facultyService.getAllFaculty();

            return res.status(200).json(result);

        } catch (error) {

            console.error("Get All Faculty Error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

    async getFacultyByDepartment(req, res) {
        try {

            const { department } = req.params;

            const result = await facultyService.getFacultyByDepartment(
                department
            );

            return res.status(200).json(result);

        } catch (error) {

            console.error("Department Faculty Error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

    async updateFaculty(req, res) {
        try {

            const { id } = req.params;

            const result = await facultyService.updateFaculty(
                id,
                req.body
            );

            if (!result.success) {
                return res.status(404).json(result);
            }

            return res.status(200).json(result);

        } catch (error) {

            console.error("Update Faculty Error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

    async deleteFaculty(req, res) {
        try {

            const { id } = req.params;

            const result = await facultyService.deleteFaculty(id);

            if (!result.success) {
                return res.status(404).json(result);
            }

            return res.status(200).json(result);

        } catch (error) {

            console.error("Delete Faculty Error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }
}

export default new FacultyController();