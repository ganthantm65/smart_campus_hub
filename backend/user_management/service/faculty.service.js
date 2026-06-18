import pool from "../util/db.js";

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
}

export default new FacultyService();