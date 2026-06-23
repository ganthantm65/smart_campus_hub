import pool from "../util/db";
import { redisClient } from "../util/redis.js";

class CourseController{
    async createCourse(course){
        const {course_code,course_name,credits,semester,department}=course;

        try {
            await pool.query("BEGIN");

            const dept_id=await pool.query(`
                SELECT department_id FROM department
                WHERE department_name=$1
                `,[department]);
            
            if(!dept_id){
                throw new Error("Department is not found");
            }
            
            const result=await pool.query(
                `INSERT INTO course(
                    course_code,
                    course_name,
                    credits,
                    semester,
                    department_id
                )
                VALUES ($1,$2,$3,$4)`,[
                    course_code,
                    course_name,
                    credits,
                    semester,
                    dept_id
                ]
            );

            await redisClient.del("courses:all");

            await pool.query("COMMIT");

            return {success:true,message:"course created"};
        } catch (error) {
            await pool.query("ROLLBACK");
            return {success:false,message:error.message};   
        }
    }

    async getCourseById(courseId) {

        const redisKey = `course:${courseId}`;

        const cachedCourse = await redisClient.get(redisKey);

        if (cachedCourse) {
            return {
                success: true,
                source: "cache",
                data: JSON.parse(cachedCourse)
            };
        }

        const result = await pool.query(
            `
            SELECT
                c.*,
                d.department_name
            FROM course c
            JOIN department d
                ON c.department_id = d.department_id
            WHERE c.course_id = $1
            `,
            [courseId]
        );

        if (result.rows.length === 0) {
            return {
                success: false,
                message: "Course not found"
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
    async getByCourseCode(courseCode) {

        const redisKey = `course:code:${courseCode}`;

        const cached = await redisClient.get(redisKey);

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
            FROM course
            WHERE course_code = $1
            `,
            [courseCode]
        );

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

    async getByCourseName(courseName) {

        const redisKey =
            `course:name:${courseName.toLowerCase()}`;

        const cached = await redisClient.get(redisKey);

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
                c.*,
                d.department_name
            FROM course c
            JOIN department d
                ON c.department_id = d.department_id
            WHERE c.course_name ILIKE $1
            `,
            [`%${courseName}%`]
        );

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

    async getByDepartment(department) {

        const redisKey =
            `course:department:${department}`;

        const cached = await redisClient.get(redisKey);

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
                c.*,
                d.department_name
            FROM course c
            JOIN department d
                ON c.department_id = d.department_id
            WHERE d.department_name = $1
            `,
            [department]
        );

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

    async updateCourse(courseId, courseData) {

        const {
            course_code,
            course_name,
            credits,
            semester,
            department
        } = courseData;

        try {

            const deptResult = await pool.query(
                `
                SELECT department_id
                FROM department
                WHERE department_name = $1
                `,
                [department]
            );

            if (deptResult.rows.length === 0) {
                throw new Error("Department not found");
            }

            const department_id = deptResult.rows[0].department_id;

            const result = await pool.query(
                `
                UPDATE course
                SET
                    course_code = $1,
                    course_name = $2,
                    credits = $3,
                    semester = $4,
                    department_id = $5
                WHERE course_id = $6
                RETURNING *
                `,
                [
                    course_code,
                    course_name,
                    credits,
                    semester,
                    department_id,
                    courseId
                ]
            );

            if (result.rows.length === 0) {
                return {
                    success: false,
                    message: "Course not found"
                };
            }

            // Clear course caches
            const keys = await redisClient.keys("course:*");

            if (keys.length > 0) {
                await redisClient.del(keys);
            }

            await redisClient.del("courses:all");

            return {
                success: true,
                message: "Course updated successfully",
                data: result.rows[0]
            };

        } catch (error) {

            return {
                success: false,
                message: error.message
            };
        }
    }

    async deleteCourse(courseId) {

        try {

            const result = await pool.query(
                `
                DELETE FROM course
                WHERE course_id = $1
                RETURNING *
                `,
                [courseId]
            );

            if (result.rows.length === 0) {
                return {
                    success: false,
                    message: "Course not found"
                };
            }

            // Clear course caches
            const keys = await redisClient.keys("course:*");

            if (keys.length > 0) {
                await redisClient.del(keys);
            }

            await redisClient.del("courses:all");

            return {
                success: true,
                message: "Course deleted successfully"
            };

        } catch (error) {

            return {
                success: false,
                message: error.message
            };
        }
    }
}