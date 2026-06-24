import pool from "../util/db.js";
import { redisClient } from "../util/redis.js";

class enrollmentService{
    async enrollStudentsToCourse(enrollment){
        const {student_name,roll_no,course_name,course_code}=enrollment;

        try {
            await pool.query('BEGIN');

            const student_id=await pool.query(
                `SELECT student_id
                FROM student_profile
                WHERE full_name=$1 AND roll_no=$2`,
                [
                    student_name,
                    roll_no
                ]
            );

            if(student_id.rowCount==0){
                throw new Error("student is not found");
            }

            const course_id=await pool.query(
                `SELECT course_id
                FROM course
                WHERE course_name=$1 AND course_code=$2`,
                [
                    course_name,
                    course_code
                ]
            );

            if(course_id.rowCount==0){
                throw new Error("course is not found");
            }

            await pool.query(
                `INSERT INTO enrollment(
                    student_id,
                    course_id
                ) VALUES ($1,$2)
                `,
                [
                    student_id.rows[0].student_id,
                    course_id.rows[0].course_id
                ]
            )
            await redisClient.del("enrollments:all");

            await redisClient.del(
                `student:courses:${student_id.rows[0].student_id}`
            );

            await redisClient.del(
                `course:students:${course_id.rows[0].course_id}`
            );
            await pool.query('COMMIT');

            return {success:true,message:"Student enrolled successfully"}
        } catch (error) {
            await pool.query('ROLLBACK');
            return {success:false,message:error.message};
        }
    }

    async getEnrollmentsByDepartment(department) {

        const redisKey = `enrollments:department:${department}`;

        const cached = await redisClient.get(redisKey);

        if (cached) {
            return {
                success: true,
                source: "cache",
                data: JSON.parse(cached)
            };
        }

        const query = `
            SELECT
                s.student_id,
                s.roll_no,
                s.full_name,
                s.department,
                s.semester,
                u.email,
                c.course_id,
                c.course_code,
                c.course_name,
                c.credits,
                e.enrollment_id,
                e.enrolled_at
            FROM student_profile s
            INNER JOIN users u
                ON s.user_id = u.user_id
            INNER JOIN enrollment e
                ON s.student_id = e.student_id
            INNER JOIN course c
                ON e.course_id = c.course_id
            WHERE s.department = $1
            ORDER BY s.full_name
        `;

        const { rows } = await pool.query(query,[department]);

        await redisClient.setEx(
            redisKey,
            3600,
            JSON.stringify(rows)
        );

        return {
            success:true,
            source:"database",
            data:rows
        };
    }

    async getStudentCourses(studentId) {
        try {

            const redisKey = `student:courses:${studentId}`;

            const cached = await redisClient.get(redisKey);

            if(cached){
                return {
                    success:true,
                    source:"cache",
                    data:JSON.parse(cached)
                };
            }

            const query = ` 
                SELECT
                    e.enrollment_id,
                    e.enrolled_at,
                    c.course_id,
                    c.course_code,
                    c.course_name,
                    c.credits,
                    c.semester
                FROM enrollment e
                INNER JOIN course c
                    ON e.course_id = c.course_id
                WHERE e.student_id = $1
                ORDER BY c.semester
            `;

            const { rows } = await pool.query(query,[studentId]);

            await redisClient.setEx(
                redisKey,
                3600,
                JSON.stringify(rows)
            );

            return {
                success: true,
                count: rows.length,
                data: rows
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async getCourseStudents(courseId) {
        try {
            const redisKey = `course:students:${courseId}`;

            const cached = await redisClient.get(redisKey);

            if(cached){
                return {
                    success:true,
                    source:"cache",
                    data:JSON.parse(cached)
                };
            }

            const query = `
                SELECT
                    e.enrollment_id,
                    e.enrolled_at,

                    s.student_id,
                    s.roll_no,
                    s.full_name,
                    s.department,
                    s.semester,

                    u.email

                FROM enrollment e

                INNER JOIN student_profile s
                    ON e.student_id = s.student_id

                INNER JOIN users u
                    ON s.user_id = u.user_id

                WHERE e.course_id = $1

                ORDER BY s.roll_no
            `;

            const { rows } = await pool.query(query, [courseId]);

            await redisClient.setEx(
                redisKey,
                3600,
                JSON.stringify(rows)
            );

            return {
                success: true,
                count: rows.length,
                data: rows
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async unenrollStudentsByDepartmentAndSemester(department, semester) {
        try {
            const query = `
                DELETE FROM enrollment
                WHERE student_id IN (
                    SELECT student_id
                    FROM student_profile
                    WHERE department = $1
                    AND semester = $2
                )
                RETURNING *
            `;

            const result = await pool.query(
                query,
                [department, semester]
            );

            await redisClient.del(
                `enrollments:department:${department}`
            );

            const studentKeys =
                await redisClient.keys("student:courses:*");

            if(studentKeys.length > 0){
                await redisClient.del(studentKeys);
            }

            const courseKeys =
                await redisClient.keys("course:students:*");

            if(courseKeys.length > 0){
                await redisClient.del(courseKeys);
            }

            return {
                success: true,
                message: `${result.rowCount} enrollments removed`,
                count: result.rowCount,
                data: result.rows
            };

        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async bulkEnrollDepartmentStudents(
        courseId,
        department,
        semester
    ) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const students = await client.query(
                `
                SELECT student_id
                FROM student_profile
                WHERE department = $1
                AND semester = $2
                `,
                [department, semester]
            );
            let enrolledCount = 0;
            for (const student of students.rows) {
                const exists = await client.query(
                    `
                    SELECT enrollment_id
                    FROM enrollment
                    WHERE student_id = $1
                    AND course_id = $2
                    `,
                    [student.student_id, courseId]
                );
                if (exists.rows.length === 0) {

                    await client.query(
                        `
                        INSERT INTO enrollment
                        (
                            student_id,
                            course_id
                        )
                        VALUES
                        ($1,$2)
                        `,
                        [student.student_id, courseId]
                    );
                    enrolledCount++;
                }
            }
            await client.query("COMMIT");

            const keys = await redisClient.keys("student:courses:*");

            if(keys.length > 0){
                await redisClient.del(keys);
            }

            const courseStudentsKey =
                `course:students:${courseId}`;

            await redisClient.del(courseStudentsKey);

            await redisClient.del(
                `enrollments:department:${department}`
            );

            return {
                success: true,
                enrolledCount
            };
        } catch (error){

            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }
    async unenrollStudent(enrollmentId) {
        try {
            const result = await pool.query(
                `
                DELETE FROM enrollment
                WHERE enrollment_id = $1
                RETURNING *
                `,
                [enrollmentId]
            );

            if (result.rows.length === 0) {
                return {
                    success: false,
                    message: "Enrollment not found"
                };
            }

            await redisClient.del(`enrollment:${enrollmentId}`);
            await redisClient.del(`enrollments:all`);

            return {
                success: true,
                message: "Student unenrolled successfully",
                data: result.rows[0]
            };

        } catch (error) {

            return {
                success: false,
                message: error.message
            };
        }
    }

    async getEnrollmentById(enrollmentId) {
        try {
            const cacheKey = `enrollment:${enrollmentId}`;
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                return {
                    success: true,
                    source: "cache",
                    data: JSON.parse(cachedData)
                };
            }

            const query = `
                SELECT
                    e.enrollment_id,
                    e.enrolled_at,

                    s.student_id,
                    s.roll_no,
                    s.full_name,

                    c.course_id,
                    c.course_code,
                    c.course_name

                FROM enrollment e

                JOIN student_profile s
                    ON e.student_id = s.student_id

                JOIN course c
                    ON e.course_id = c.course_id

                WHERE e.enrollment_id = $1
            `;

            const result = await pool.query(query, [enrollmentId]);

            if (result.rows.length === 0) {
                return {
                    success: false,
                    message: "Enrollment not found"
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

        } catch (error) {

            return {
                success: false,
                message: error.message
            };
        }
    }
    async getCurrentSemesterCourses(studentId) {

        try {

            const query = `
                SELECT
                    c.course_id,
                    c.course_code,
                    c.course_name,
                    c.credits,
                    c.semester

                FROM enrollment e

                JOIN course c
                    ON e.course_id = c.course_id

                JOIN student_profile s
                    ON e.student_id = s.student_id

                WHERE s.student_id = $1
                AND c.semester = s.semester

                ORDER BY c.course_name
            `;

            const result = await pool.query(
                query,
                [studentId]
            );

            return {
                success: true,
                count: result.rows.length,
                data: result.rows
            };

        } catch (error) {

            return {
                success: false,
                message: error.message
            };
        }
    }
    async isStudentEnrolled(studentId, courseId) {

        try {

            const result = await pool.query(
                `
                SELECT enrollment_id
                FROM enrollment
                WHERE student_id = $1
                AND course_id = $2
                `,
                [studentId, courseId]
            );

            return {
                success: true,
                enrolled: result.rows.length > 0
            };

        } catch (error) {

            return {
                success: false,
                message: error.message
            };
        }
    }
    async getStudentCourseCount(studentId) {
        try {
            const result = await pool.query(
                `
                SELECT COUNT(*) AS total_courses
                FROM enrollment
                WHERE student_id = $1
                `,
                [studentId]
            );

            return {
                success: true,
                studentId,
                totalCourses: parseInt(
                    result.rows[0].total_courses
                )
            };

        } catch (error) {

            return {
                success: false,
                message: error.message
            };
        }
    }
}

export default new enrollmentService();