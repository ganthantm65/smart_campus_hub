import pool from "../util/db.js";
import { redisClient } from "../util/redis.js";

class StudentService {

    async createStudent(studentData) {

        const {
            email,
            roll_no,
            full_name,
            department_name,
            semester,
            year,
            phone,
            address
        } = studentData;

        const client = await pool.connect();

        try {

            await client.query("BEGIN");

            const userResult = await client.query(
                `
                SELECT
                    u.user_id,
                    r.role_name
                FROM users u
                JOIN role r
                    ON u.role_id = r.role_id
                WHERE u.email = $1
                `,
                [email]
            );

            if (userResult.rows.length === 0) {
                throw new Error("User not found");
            }

            const user = userResult.rows[0];

            if (user.role_name !== "STUDENT") {
                throw new Error(
                    "Provided email does not belong to a student"
                );
            }

            const existingStudent = await client.query(
                `
                SELECT student_id
                FROM student_profile
                WHERE user_id = $1
                `,
                [user.user_id]
            );

            if (existingStudent.rows.length > 0) {
                throw new Error(
                    "Student profile already exists"
                );
            }

            const deptResult = await client.query(
                `
                SELECT department_id
                FROM department
                WHERE department_name = $1
                `,
                [department_name]
            );

            if (deptResult.rows.length === 0) {
                throw new Error("Department not found");
            }

            const departmentId =
                deptResult.rows[0].department_id;

            const result = await client.query(
                `
                INSERT INTO student_profile
                (
                    user_id,
                    roll_no,
                    full_name,
                    department_id,
                    semester,
                    year,
                    phone,
                    address
                )
                VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8)
                RETURNING *
                `,
                [
                    user.user_id,
                    roll_no,
                    full_name,
                    departmentId,
                    semester,
                    year,
                    phone,
                    address
                ]
            );

            await client.query("COMMIT");

            return {
                success: true,
                message: "Student profile created successfully",
                data: result.rows[0]
            };

            } catch (error) {

                await client.query("ROLLBACK");

                console.error(error);

                throw error;   // <-- Throw the error to the controller

            } finally {

                client.release();

            }
    }

    async getStudentById(studentId) {

        const redisKey = `student:${studentId}`;

        const cached = await redisClient.get(redisKey);

        if (cached) {
            return {
                source: "cache",
                data: JSON.parse(cached)
            };
        }

        const result = await pool.query(
            `
            SELECT
                u.user_id,
                u.name,
                u.email,
                r.role_name,
                s.student_id,
                s.roll_no,
                s.full_name,
                d.department_name,
                s.semester,
                s.year,
                s.phone,
                s.address,
                s.created_at
            FROM student_profile s
            JOIN users u
                ON s.user_id = u.user_id
            JOIN role r
                ON u.role_id = r.role_id
            JOIN department d
                ON s.department_id = d.department_id
            WHERE s.student_id = $1
            `,
            [studentId]
        );

        if (result.rows.length === 0) {
            throw new Error("Student not found");
        }

        await redisClient.setEx(
            redisKey,
            3600,
            JSON.stringify(result.rows[0])
        );

        return {
            source: "database",
            data: result.rows[0]
        };
    }
    async getMyProfile(userId) {

        const result = await pool.query(
            `
            SELECT
                u.user_id,
                u.name,
                u.email,
                r.role_name,
                s.*
            FROM users u
            JOIN role r
                ON u.role_id = r.role_id
            JOIN student_profile s
                ON u.user_id = s.user_id
            WHERE u.user_id = $1
            `,
            [userId]
        );

        if (result.rows.length === 0) {
            throw new Error("Profile not found");
        }

        return result.rows[0];
    }

    async updateStudent(studentId, studentData) {

        const {
            roll_no,
            full_name,
            department,
            semester,
            year,
            phone,
            address
        } = studentData;

        const result = await pool.query(
            `
            UPDATE student_profile
            SET
                roll_no = $1,
                full_name = $2,
                department = $3,
                semester = $4,
                year = $5,
                phone = $6,
                address = $7
            WHERE student_id = $8
            RETURNING *
            `,
            [
                roll_no,
                full_name,
                department,
                semester,
                year,
                phone,
                address,
                studentId
            ]
        );

        if (result.rows.length === 0) {
            throw new Error("Student not found");
        }

        await redisClient.del(`student:${studentId}`);

        return result.rows[0];
    }

    async deleteStudent(studentId) {

        const result = await pool.query(
            `
            DELETE FROM student_profile
            WHERE student_id = $1
            RETURNING *
            `,
            [studentId]
        );

        if (result.rows.length === 0) {
            throw new Error("Student not found");
        }

        await redisClient.del(`student:${studentId}`);

        return {
            success: true,
            message: "Student deleted successfully"
        };
    }

    async getAllStudents() {

        const result = await pool.query(
            `
            SELECT
                s.student_id,
                s.roll_no,
                s.full_name,
                d.department_name,
                s.semester,
                s.year,
                s.phone,
                s.address,
                u.email,
                s.created_at
            FROM student_profile s
            JOIN users u
                ON s.user_id = u.user_id
            JOIN department d
                ON s.department_id = d.department_id
            ORDER BY s.student_id
            `
        );

        return result.rows;
    }
    async searchStudents(keyword) {

        const result = await pool.query(
            `
            SELECT
                s.student_id,
                s.roll_no,
                s.full_name,
                d.department_name,
                s.semester,
                s.year,
                s.phone,
                s.address,
                u.email
            FROM student_profile s
            JOIN users u
                ON s.user_id = u.user_id
            JOIN department d
                ON s.department_id = d.department_id
            WHERE
                LOWER(s.full_name) LIKE LOWER($1)
                OR LOWER(s.roll_no) LIKE LOWER($1)
                OR LOWER(u.email) LIKE LOWER($1)
            ORDER BY s.full_name
            `,
            [`%${keyword}%`]
        );

        return result.rows;
    }
    async getStudentsByDepartment(departmentName) {

        const result = await pool.query(
            `
            SELECT
                s.student_id,
                s.roll_no,
                s.full_name,
                d.department_name,
                s.semester,
                s.year,
                s.phone,
                u.email
            FROM student_profile s
            JOIN users u
                ON s.user_id = u.user_id
            JOIN department d
                ON s.department_id = d.department_id
            WHERE d.department_name = $1
            ORDER BY s.roll_no
            `,
            [departmentName]
        );

        return result.rows;
    }

    async getStudentsBySemester(semester) {

        const result = await pool.query(
            `
            SELECT
                s.student_id,
                s.roll_no,
                s.full_name,
                d.department_name,
                s.semester,
                s.year,
                s.phone,
                u.email
            FROM student_profile s
            JOIN users u
                ON s.user_id = u.user_id
            JOIN department d
                ON s.department_id = d.department_id
            WHERE s.semester = $1
            ORDER BY s.roll_no
            `,
            [semester]
        );

        return result.rows;
    }


}

export default new StudentService();