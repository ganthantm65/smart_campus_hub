import pool from "../util/db.js";
import { redisClient } from "../util/redis.js";

class FacultyService {

    async createFaculty(facultyData) {

        const {
            email,
            employee_id,
            full_name,
            department,
            designation,
            phone
        } = facultyData;

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

            if (user.role_name !== "FACULTY") {
                throw new Error("User is not a faculty");
            }

            const existingFaculty = await client.query(
                `
                SELECT faculty_id
                FROM faculty_profile
                WHERE user_id = $1
                `,
                [user.user_id]
            );

            if (existingFaculty.rows.length > 0) {
                throw new Error("Faculty profile already exists");
            }

            const result = await client.query(
                `
                INSERT INTO faculty_profile
                (
                    user_id,
                    employee_id,
                    full_name,
                    department,
                    designation,
                    phone
                )
                VALUES
                ($1,$2,$3,$4,$5,$6)
                RETURNING *
                `,
                [
                    user.user_id,
                    employee_id,
                    full_name,
                    department,
                    designation,
                    phone
                ]
            );

            await client.query("COMMIT");

            return {
                success: true,
                message: "Faculty profile created successfully",
                data: result.rows[0]
            };

        } catch (error) {

            await client.query("ROLLBACK");

            return {
                success: false,
                message: error.message
            };

        } finally {

            client.release();
        }
    }

    async getFacultyById(facultyId) {

        const redisKey = `faculty:${facultyId}`;

        const cachedFaculty = await redisClient.get(redisKey);

        if (cachedFaculty) {
            return {
                success: true,
                source: "cache",
                data: JSON.parse(cachedFaculty)
            };
        }

        const result = await pool.query(
            `
            SELECT
                f.*,
                u.email,
                r.role_name
            FROM faculty_profile f
            JOIN users u
                ON f.user_id = u.user_id
            JOIN role r
                ON u.role_id = r.role_id
            WHERE f.faculty_id = $1
            `,
            [facultyId]
        );

        if (result.rows.length === 0) {
            return {
                success: false,
                message: "Faculty not found"
            };
        }

        await redisClient.setEx(
            redisKey,
            3600,
            JSON.stringify(result.rows[0])
        );

        return {
            success: true,
            source: "database",
            data: result.rows[0]
        };
    }

    async getFacultyByName(name) {

        const redisKey = `faculty:name:${name.toLowerCase()}`;

        const cachedFaculty = await redisClient.get(redisKey);

        if (cachedFaculty) {
            return {
                success: true,
                source: "cache",
                data: JSON.parse(cachedFaculty)
            };
        }

        const result = await pool.query(
            `
            SELECT
                f.*,
                u.email,
                r.role_name
            FROM faculty_profile f
            JOIN users u
                ON f.user_id = u.user_id
            JOIN role r
                ON u.role_id = r.role_id
            WHERE f.full_name ILIKE $1
            `,
            [`%${name}%`]
        );

        if (result.rows.length === 0) {
            return {
                success: false,
                message: "Faculty not found"
            };
        }

        await redisClient.setEx(
            redisKey,
            3600,
            JSON.stringify(result.rows)
        );

        return {
            success: true,
            source: "database",
            data: result.rows
        };
    }

    async getAllFaculty() {

        const result = await pool.query(
            `
            SELECT
                f.*,
                u.email,
                r.role_name
            FROM faculty_profile f
            JOIN users u
                ON f.user_id = u.user_id
            JOIN role r
                ON u.role_id = r.role_id
            ORDER BY f.full_name
            `
        );

        return {
            success: true,
            data: result.rows
        };
    }

    async getFacultyByDepartment(department) {

        const result = await pool.query(
            `
            SELECT
                f.*,
                u.email,
                r.role_name
            FROM faculty_profile f
            JOIN users u
                ON f.user_id = u.user_id
            JOIN role r
                ON u.role_id = r.role_id
            WHERE f.department = $1
            `,
            [department]
        );

        return {
            success: true,
            data: result.rows
        };
    }

    async updateFaculty(facultyId, facultyData) {

        const {
            employee_id,
            full_name,
            department,
            designation,
            phone
        } = facultyData;

        const result = await pool.query(
            `
            UPDATE faculty_profile
            SET
                employee_id = $1,
                full_name = $2,
                department = $3,
                designation = $4,
                phone = $5
            WHERE faculty_id = $6
            RETURNING *
            `,
            [
                employee_id,
                full_name,
                department,
                designation,
                phone,
                facultyId
            ]
        );

        if (result.rows.length === 0) {
            return {
                success: false,
                message: "Faculty not found"
            };
        }

        await redisClient.del(`faculty:${facultyId}`);

        return {
            success: true,
            message: "Faculty updated successfully",
            data: result.rows[0]
        };
    }

    async deleteFaculty(facultyId) {

        const result = await pool.query(
            `
            DELETE FROM faculty_profile
            WHERE faculty_id = $1
            RETURNING *
            `,
            [facultyId]
        );

        if (result.rows.length === 0) {
            return {
                success: false,
                message: "Faculty not found"
            };
        }

        await redisClient.del(`faculty:${facultyId}`);

        return {
            success: true,
            message: "Faculty deleted successfully"
        };
    }
}

export default new FacultyService();