import pool from "../util/db.js";
import { redisClient } from "../util/redis.js";

class FacultyCourseMappingService {

    async assignFacultyToCourse(mappingData) {

        const {
            faculty_name,
            department,
            course_code,
            academicYear,
            semester,
            section
        } = mappingData;

        try {

            // Get Faculty ID using faculty name + department
            const facultyResult = await pool.query(
                `
                SELECT
                    fp.faculty_id
                FROM faculty_profile fp
                JOIN department d
                    ON fp.department_id = d.department_id
                WHERE fp.full_name = $1
                AND d.department_name = $2
                `,
                [
                    faculty_name,
                    department
                ]
            );

            if (facultyResult.rows.length === 0) {
                throw new Error("Faculty not found");
            }

            const facultyId =
                facultyResult.rows[0].faculty_id;

            // Get Course ID using course code
            const courseResult = await pool.query(
                `
                SELECT
                    course_id
                FROM course
                WHERE course_code = $1
                `,
                [course_code]
            );

            if (courseResult.rows.length === 0) {
                throw new Error("Course not found");
            }

            const courseId =
                courseResult.rows[0].course_id;

            // Check existing mapping
            const existing = await pool.query(
                `
                SELECT mapping_id
                FROM faculty_course_mapping
                WHERE faculty_id = $1
                AND course_id = $2
                AND academic_year = $3
                AND semester = $4
                `,
                [
                    facultyId,
                    courseId,
                    academicYear,
                    semester
                ]
            );

            if (existing.rows.length > 0) {
                throw new Error(
                    "Faculty already assigned to this course"
                );
            }

            // Insert mapping
            const result = await pool.query(
                `
                INSERT INTO faculty_course_mapping
                (
                    faculty_id,
                    course_id,
                    academic_year,
                    semester,
                    section
                )
                VALUES
                ($1,$2,$3,$4,$5)
                RETURNING *
                `,
                [
                    facultyId,
                    courseId,
                    academicYear,
                    semester,
                    section
                ]
            );

            // Clear caches
            await redisClient.del(
                `faculty:courses:${facultyId}`
            );

            await redisClient.del(
                `course:faculty:${courseId}`
            );

            await redisClient.del(
                `faculty:currentCourses:${facultyId}`
            );

            return {
                success: true,
                message: "Faculty assigned successfully",
                data: {
                    mapping_id: result.rows[0].mapping_id,
                    faculty_id: facultyId,
                    course_id: courseId,
                    faculty_name,
                    department,
                    course_code,
                    academic_year: academicYear,
                    semester,
                    section
                }
            };

        } catch (error) {

            console.error(
                "Assign Faculty Error:",
                error
            );

            return {
                success: false,
                message: error.message
            };
        }
    }
    // ==========================
    // Get Mapping By Id
    // ==========================
    async getMappingById(mappingId) {

        const cacheKey = `mapping:${mappingId}`;

        const cached = await redisClient.get(cacheKey);

        if (cached) {
            return {
                success: true,
                source: "cache",
                data: JSON.parse(cached)
            };
        }

        const result = await pool.query(
            `
            SELECT *
            FROM faculty_course_mapping
            WHERE mapping_id = $1
            `,
            [mappingId]
        );

        if (result.rows.length === 0) {
            return {
                success: false,
                message: "Mapping not found"
            };
        }

        await redisClient.setEx(
            cacheKey,
            3600,
            JSON.stringify(result.rows[0])
        );

        return {
            success: true,
            source: "database",
            data: result.rows[0]
        };
    }

    // ==========================
    // Update Mapping
    // ==========================
    async updateMapping(mappingId, data) {

        const {
            facultyId,
            courseId,
            academicYear,
            semester,
            section
        } = data;

        const result = await pool.query(
            `
            UPDATE faculty_course_mapping
            SET
                faculty_id = COALESCE($1, faculty_id),
                course_id = COALESCE($2, course_id),
                academic_year = COALESCE($3, academic_year),
                semester = COALESCE($4, semester),
                section = COALESCE($5, section)
            WHERE mapping_id = $6
            RETURNING *
            `,
            [
                facultyId,
                courseId,
                academicYear,
                semester,
                section,
                mappingId
            ]
        );

        if (result.rows.length === 0) {
            return {
                success: false,
                message: "Mapping not found"
            };
        }

        await redisClient.del(`mapping:${mappingId}`);

        return {
            success: true,
            message: "Mapping updated successfully",
            data: result.rows[0]
        };
    }

    // ==========================
    // Delete Mapping
    // ==========================
    async deleteMapping(mappingId) {

        const result = await pool.query(
            `
            DELETE FROM faculty_course_mapping
            WHERE mapping_id = $1
            RETURNING *
            `,
            [mappingId]
        );

        if (result.rows.length === 0) {
            return {
                success: false,
                message: "Mapping not found"
            };
        }

        await redisClient.del(`mapping:${mappingId}`);

        return {
            success: true,
            message: "Mapping deleted successfully"
        };
    }

    // ==========================
    // Get Faculty Courses
    // ==========================
    async getFacultyCourses(facultyId) {

        const cacheKey = `faculty:courses:${facultyId}`;

        const cached = await redisClient.get(cacheKey);

        if (cached) {
            return {
                success: true,
                source: "cache",
                data: JSON.parse(cached)
            };
        }

        const result = await pool.query(
            `
            SELECT
                c.course_id,
                c.course_code,
                c.course_name,
                c.credits,
                fcm.academic_year,
                fcm.semester,
                fcm.section
            FROM faculty_course_mapping fcm
            JOIN course c
            ON fcm.course_id = c.course_id
            WHERE fcm.faculty_id = $1
            `,
            [facultyId]
        );

        await redisClient.setEx(
            cacheKey,
            3600,
            JSON.stringify(result.rows)
        );

        return {
            success: true,
            data: result.rows
        };
    }

    // ==========================
    // Current Semester Courses
    // ==========================
    async getCurrentSemesterCourses(facultyId) {

        const result = await pool.query(
            `
            SELECT
                c.course_id,
                c.course_code,
                c.course_name,
                c.credits,
                fcm.section
            FROM faculty_course_mapping fcm
            JOIN course c
            ON fcm.course_id = c.course_id
            WHERE fcm.faculty_id = $1
            AND fcm.semester =
            (
                SELECT MAX(semester)
                FROM faculty_course_mapping
                WHERE faculty_id = $1
            )
            `,
            [facultyId]
        );

        return {
            success: true,
            data: result.rows
        };
    }

    // ==========================
    // Get Faculty By Course
    // ==========================
    async getFacultyByCourse(courseId) {

        const cacheKey = `course:faculty:${courseId}`;

        const cached = await redisClient.get(cacheKey);

        if (cached) {
            return {
                success: true,
                source: "cache",
                data: JSON.parse(cached)
            };
        }

        const result = await pool.query(
            `
            SELECT
                f.faculty_id,
                f.full_name,
                f.department,
                f.designation,
                f.phone
            FROM faculty_course_mapping fcm
            JOIN faculty_profile f
            ON fcm.faculty_id = f.faculty_id
            WHERE fcm.course_id = $1
            `,
            [courseId]
        );

        if (result.rows.length === 0) {
            return {
                success: false,
                message: "No faculty assigned"
            };
        }

        await redisClient.setEx(
            cacheKey,
            3600,
            JSON.stringify(result.rows)
        );

        return {
            success: true,
            data: result.rows
        };
    }
}

export default new FacultyCourseMappingService();