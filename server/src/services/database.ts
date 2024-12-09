import { User } from "../models/User";
import { University } from "../models/University";
import { Comment } from "../models/Comment";
import pool from "./connection";
import { RowDataPacket } from "mysql2";
import { ResultSetHeader } from "mysql2/promise";
import { QueryResult, FieldPacket } from "mysql2/promise";

export async function getUserByID(userID: number): Promise<User> {
    const [rows] = await pool.query(`SELECT * FROM User u WHERE u.userID LIKE '${userID}';`);
    const users = rows as User[]
    return users[0] || null;
}

export async function loginVerify(email: String, password: String): Promise<number> {
    const [rows] = await pool.query(`SELECT * FROM User u WHERE u.email LIKE '${email}' and u.password = '${password}';`);
    const users = rows as User[]
    if (users.length == 1) {
        return users[0].userID;
    }
    else {
        return -1;
    }
}

export async function addUser(user: Omit<User, 'userID'>): Promise<number> {
    const checkEmailQuery = 'SELECT email FROM User WHERE email = ?';
    const [existingUsers] = await pool.query(checkEmailQuery, [user.email]);

    // email has already existed, no operation
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        return 1; // has already existed 
    }
    const sqlQuery = `INSERT INTO User (userName, email, password) VALUES ('${user.userName}', '${user.email}', '${user.password}');`;
    await pool.query(sqlQuery);
    return 0; // successfully
}

export async function updateUserName(userID: number, newUserName: string): Promise<number> {
    try {
        const updateQuery = 'UPDATE User SET userName = ? WHERE userID = ?';
        console.log(newUserName);
        await pool.execute(updateQuery, [newUserName, userID]);
        return 0; // success

    } catch (error) {
        console.error('Error in updateUserName:', error);
        return 1; // fail
    }
}

export async function deleteUser(userID: number): Promise<number> {
    try {
        const checkUserQuery = 'SELECT userID FROM User WHERE userID = ?';
        const [existingUser] = await pool.query(checkUserQuery, [userID]);

        if (!Array.isArray(existingUser) || existingUser.length === 0) {
            return 1; // user not found
        }

        const deleteQuery = 'DELETE FROM User WHERE userID = ?';
        await pool.query(deleteQuery, [userID]);
        return 0; // successfully deleted

    } catch (error) {
        console.error('Error in deleteUser:', error);
        throw error;
    }
}

export async function searchRanking(
    keyword: string,
    countryFilter?: string,
    sourceFilter?: string,
    academicRepFilter?: string
): Promise<any[]> {
    try {
        let academicRepCondition = "";
        if (academicRepFilter === "<30") {
            academicRepCondition = "AND rm.academicRep < 30";
        } else if (academicRepFilter === "30-60") {
            academicRepCondition = "AND rm.academicRep BETWEEN 30 AND 60";
        } else if (academicRepFilter === ">60") {
            academicRepCondition = "AND rm.academicRep > 60";
        }

        const sqlQuery = `
            SELECT 
                rm.universityName,
                rm.source,
                rm.academicRep,
                rm.employerRep,
                rm.facultyStudentScore,
                rm.citationPerFaculty,
                rm.internationalScore,
                u.location,
                u.country
            FROM 
                RankingMetric rm
            INNER JOIN 
                University u
            ON 
                rm.universityName = u.universityName
            WHERE 
                rm.universityName LIKE ?
                ${countryFilter ? "AND u.country LIKE ?" : ""}
                ${sourceFilter ? "AND rm.source = ?" : ""}
                ${academicRepCondition} -- 添加 Academic Rep ���选条件
        `;

        const queryParams = [`%${keyword}%`];
        if (countryFilter) queryParams.push(`%${countryFilter}%`);
        if (sourceFilter) queryParams.push(sourceFilter);

        const [rows] = await pool.query(sqlQuery, queryParams);
        return rows as any[];
    } catch (error) {
        console.error("Error in searchRanking:", error);
        throw error;
    }
}



// 添加收藏
export async function addFavourite(userID: number, universityName: string): Promise<void> {
    const sqlQueryCheck = `SELECT * FROM Favourite WHERE userID = ? AND universityName = ?`;
    const sqlQueryInsert = `INSERT INTO Favourite (userID, universityName) VALUES (?, ?)`;

    try {
        // 检查记录是否已存在
        const [rows]: any = await pool.execute(sqlQueryCheck, [userID, universityName]);
        if (rows.length > 0) {
            console.log(`Record already exists: userID=${userID}, universityName=${universityName}`);
            return; // 如果已存在，则不执行插入
        }

        // 插入记录
        console.log(`Attempting to insert: userID=${userID}, universityName=${universityName}`);
        const [result]: any = await pool.execute(sqlQueryInsert, [userID, universityName]);
        console.log(`Insert result:`, result);
    } catch (error) {
        console.error("Error in addFavourite:", error);
        throw error;
    }
}


export async function removeFavourite(userID: number, universityName: string): Promise<void> {
    const sqlQuery = `DELETE FROM Favourite WHERE userID = ? AND universityName = ?`;

    try {
        console.log(`Executing DELETE SQL: ${sqlQuery} with params: userID=${userID}, universityName=${universityName}`);
        const [result]: any = await pool.execute(sqlQuery, [userID, universityName]);
        console.log("SQL execution result:", result);

        if (result.affectedRows === 0) {
            console.warn(`No record found to delete for userID=${userID}, universityName=${universityName}`);
        } else {
            console.log(`Successfully deleted record for userID=${userID}, universityName=${universityName}`);
        }
    } catch (error) {
        console.error("Error in removeFavourite:", error);
        throw error;
    }
}




// 检查是否已收藏
export async function isFavourite(userID: number, universityName: string): Promise<boolean> {
    const sqlQuery = `SELECT * FROM Favourite WHERE userID = ? AND universityName = ?`;
    try {
        const [rows] = await pool.execute(sqlQuery, [userID, universityName]);
        return (rows as RowDataPacket[]).length > 0;
    } catch (error) {
        console.error("Error in isFavourite:", error);
        throw error;
    }
}

export async function filterRankingWithTransaction({
    keyword = null,
    country = null,
    source = null,
    academicRepFilter = null,
    employerRepFilter = null,
    facultyStudentFilter = null,
    citationPerFacultyFilter = null,
    internationalScoreFilter = null
}: {
    keyword?: string | null,
    country?: string | null,
    source?: string | null,
    academicRepFilter?: string | null,
    employerRepFilter?: string | null,
    facultyStudentFilter?: string | null,
    citationPerFacultyFilter?: string | null,
    internationalScoreFilter?: string | null
}): Promise<any[]> {
    try {
        console.log("Calling FilterUniversityRankings with:", {
            keyword,
            country,
            source,
            academicRepFilter,
            employerRepFilter,
            facultyStudentFilter,
            citationPerFacultyFilter,
            internationalScoreFilter
        });

        const [results]: any = await pool.query(
            `CALL FilterUniversityRankings(?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                keyword && keyword.trim() ? keyword : null,
                country && country.trim() ? country : null,
                source && source.trim() ? source : null,
                academicRepFilter && academicRepFilter.trim() ? academicRepFilter : null,
                employerRepFilter && employerRepFilter.trim() ? employerRepFilter : null,
                facultyStudentFilter && facultyStudentFilter.trim() ? facultyStudentFilter : null,
                citationPerFacultyFilter && citationPerFacultyFilter.trim() ? citationPerFacultyFilter : null,
                internationalScoreFilter && internationalScoreFilter.trim() ? internationalScoreFilter : null
            ]
        );
        console.log("FilterUniversityRankings executed successfully. Results:", results[0]);
        return results[0];
    } catch (error) {
        console.error("Error in filterRankingWithTransaction:", error);
        throw error;
    }
}


// 查询国家列表的函数
export async function getCountriesFromDatabase() {
    try {
        // 执行查询
        const [rows]: any = await pool.query("SELECT DISTINCT country FROM University;");
        // 直接返回国家列表
        return rows; // rows 应该是一个包含所有国家的数组
    } catch (error) {
        console.error("Error fetching countries:", error);
        throw new Error("Failed to fetch countries");
    }
}

/**
 * Fetches all universities from the database.
 * @returns Promise resolving to an array of University objects.
 */
export async function getAllUniversities(): Promise<University[]> {
    const sqlQuery = `
        SELECT universityName, description, establishmentDate, location, country, popularity
        FROM University
        ORDER BY popularity DESC;
    `;
    try {
        const [rows] = await pool.query<RowDataPacket[]>(sqlQuery);
        return rows as University[];
    } catch (error) {
        console.error("Error in getAllUniversities:", error);
        throw error;
    }
}

/**
 * Fetches a single university by its name.
 * @param universityName - The name of the university to fetch.
 * @returns Promise resolving to a University object or null if not found.
 */
export async function getUniversityByName(
    universityName: string,
    description?: string,
    establishmentDate?: string,
    location?: string,
    country?: string,
    popularity?: number
): Promise<University[]> {
    const sqlQuery = `
        SELECT 
            u.universityName, 
            u.description, 
            u.establishmentDate, 
            u.location, 
            u.country, 
            u.popularity
        FROM University u
        WHERE u.universityName LIKE ?
        ${description ? "AND u.description LIKE ?" : ""}
        ${establishmentDate ? "AND u.establishment LIKE ?" : ""}
        ${location ? "AND u.location LIKE ?" : ""}
        ${country ? "AND u.country LIKE ?" : ""}
        ${popularity !== undefined ? "AND u.popularity = ?" : ""}
        ORDER BY u.popularity DESC;
    `;

    const queryParams = [`%${universityName}%`];
    if (description) queryParams.push(`%${description}%`);
    if (establishmentDate) queryParams.push(`%${establishmentDate}%`);
    if (location) queryParams.push(`%${location}%`);
    if (country) queryParams.push(`%${country}%`);
    if (popularity !== undefined) queryParams.push(popularity.toString());

    try {
        const [rows] = await pool.query(sqlQuery, queryParams);
        return rows as University[];
    } catch (error) {
        console.error("Error in getUniversityByName:", error);
        throw error;
    }
}

export async function getUniversityByPopularity(popularity: number): Promise<University[]> {
    const sqlQuery = `
        SELECT universityName, description, establishmentDate, location, country, popularity
        FROM University
        WHERE popularity = ?;
    `;
    try {
        const [rows] = await pool.query<RowDataPacket[]>(sqlQuery, [popularity]);
        return rows as University[];
    } catch (error) {
        console.error("Error in getUniversityByPopularity:", error);
        throw error;
    }
}

/**
 * Creates a new university in the database.
 * @param university - The University object to create.
 * @returns Promise resolving to the created University object.
 */
export async function createUniversity(university: Omit<University, 'universityName'> & { universityName: string }): Promise<University> {
    const sqlQuery = `
        INSERT INTO University (universityName, description, establishmentDate, location, country, popularity)
        VALUES (?, ?, ?, ?, ?, ?);
    `;
    const { universityName, description, establishmentDate, location, country, popularity } = university;
    try {
        const [result] = await pool.query<ResultSetHeader>(sqlQuery, [
            universityName,
            description,
            establishmentDate,
            location,
            country,
            popularity
        ]);
        // Optionally, you can verify if the insert was successful by checking affectedRows
        if (result.affectedRows === 0) {
            throw new Error("Failed to create university");
        }
        return { universityName, description, establishmentDate, location, country, popularity };
    } catch (error) {
        console.error("Error in createUniversity:", error);
        throw error;
    }
}

/**
 * Updates an existing university's details.
 * @param universityName - The name of the university to update.
 * @param updatedFields - An object containing the fields to update.
 * @returns Promise resolving to the updated University object or null if not found.
 */
export async function updateUniversity(
    universityName: string,
    updatedFields: Partial<Omit<University, 'universityName'>>
): Promise<University[]> {
    const allowedFields: (keyof Omit<University, 'universityName'>)[] = ['description', 'establishmentDate', 'location', 'country', 'popularity'];
    const setClauses: string[] = [];
    const values: any[] = [];

    for (const key of allowedFields) {
        if (key in updatedFields) {
            setClauses.push(`${key} = ?`);
            values.push(updatedFields[key]);
        }
    }

    if (setClauses.length === 0) {
        throw new Error("No valid fields provided for update");
    }

    const setClause = setClauses.join(', ');
    const sqlQuery = `
        UPDATE University
        SET ${setClause}
        WHERE universityName = ?;
    `;
    values.push(universityName);

    try {
        const [result] = await pool.query<ResultSetHeader>(sqlQuery, values);
        if (result.affectedRows === 0) {
            return []; // University not found
        }
        // Fetch the updated university
        return await getUniversityByName(universityName);
    } catch (error) {
        console.error("Error in updateUniversity:", error);
        throw error;
    }
}

/**
 * Deletes a university from the database.
 * @param universityName - The name of the university to delete.
 * @returns Promise resolving to true if deletion was successful, false otherwise.
 */
export async function deleteUniversity(universityName: string): Promise<boolean> {
    const sqlQuery = `
        DELETE FROM University
        WHERE universityName = ?;
    `;
    try {
        const [result] = await pool.query<ResultSetHeader>(sqlQuery, [universityName]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error in deleteUniversity:", error);
        throw error;
    }
}

// comment 
export async function getAllComments(): Promise<Comment[]> {
    const sqlQuery = `SELECT * FROM Comment;`;
    try {
        const [rows] = await pool.query<RowDataPacket[]>(sqlQuery);
        return rows as Comment[];
    } catch (error) {
        console.error("Error in getAllComments:", error);
        throw error;
    }
}

export async function getCommentByUserId(userId: number): Promise<Comment[]> {
    const sqlQuery = `SELECT * FROM Comment WHERE userId = ?;`;
    try {
        const [rows] = await pool.query<RowDataPacket[]>(sqlQuery, [userId]);
        return rows as Comment[];
    } catch (error) {
        console.error("Error in getCommentByUserId:", error);
        throw error;
    }
}

export async function createComment(comment: Comment): Promise<Comment> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insert the comment
        const [result] = await connection.query<ResultSetHeader>(
            `INSERT INTO Comment (universityName, userId, livingEnvironment, library, restaurant, content, date) VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [
                comment.universityName,
                comment.userId,
                comment.livingEnvironment,
                comment.library,
                comment.restaurant,
                comment.content,
                comment.date,
            ]
        );


        await connection.commit(); // Commit transaction
        return { ...comment, commentId: result.insertId };
    } catch (error) {
        await connection.rollback(); // Rollback on error
        console.error("Error in createCommentWithTransaction:", error);
        throw error;
    } finally {
        connection.release();
    }
}

export async function updateComment(comment: Comment): Promise<Comment | null> {
    const sqlQuery = `UPDATE Comment SET universityName = ?, userId = ?, livingEnvironment = ?, library = ?, restaurant = ?, content = ?, date = ? WHERE commentId = ?;`;
    try {
        const [result] = await pool.query<ResultSetHeader>(sqlQuery, [comment.universityName, comment.userId, comment.livingEnvironment, comment.library, comment.restaurant, comment.content, comment.date, comment.commentId]);
        return result.affectedRows > 0 ? comment : null;
    } catch (error) {
        console.error("Error in updateComment:", error);
        throw error;
    }
}

export async function deleteComment(commentId: number): Promise<boolean> {
    const getCommentQuery = `SELECT universityName FROM Comment WHERE commentId = ?;`;
    const deleteQuery = `DELETE FROM Comment WHERE commentId = ?;`;
    try {
        // Fetch the university name before deleting the comment
        const [commentRows] = await pool.query<RowDataPacket[]>(getCommentQuery, [commentId]);
        if (commentRows.length === 0) {
            return false; // Comment not found
        }
        const universityName = commentRows[0].universityName;

        const [result] = await pool.query<ResultSetHeader>(deleteQuery, [commentId]);
        if (result.affectedRows > 0) {
            await updateUniversityPopularity(universityName, -1);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error in deleteComment:", error);
        throw error;
    }
}



// Function to update university popularity
async function updateUniversityPopularity(universityName: string, change: number): Promise<void> {
    const sqlQuery = `UPDATE University SET popularity = popularity + ? WHERE universityName = ?;`;
    await pool.query(sqlQuery, [change, universityName]);
}

export async function addRankingToDatabase(rankingData: {
    universityName: string;
    source: string;
    academicRep: number;
    employerRep: number;
    facultyStudentScore: number;
    citationPerFaculty: number;
    internationalScore: number;
}): Promise<void> {
    try {
        // 插入排名数据到 RankingMetric 表
        const insertRankingQuery = `
            INSERT INTO RankingMetric (
                universityName,
                source,
                academicRep,
                employerRep,
                facultyStudentScore,
                citationPerFaculty,
                internationalScore
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result]: [ResultSetHeader, FieldPacket[]] = await pool.query(insertRankingQuery, [
            rankingData.universityName,
            rankingData.source,
            rankingData.academicRep,
            rankingData.employerRep,
            rankingData.facultyStudentScore,
            rankingData.citationPerFaculty,
            rankingData.internationalScore,
        ]);

        if (result.affectedRows === 0) {
            throw new Error(`Failed to add ranking data for '${rankingData.universityName}'.`);
        }

        console.log(`Ranking data added successfully for '${rankingData.universityName}' (${rankingData.source}).`);
    } catch (error) {
        console.error("Error in addRankingToDatabase:", error);
        throw error;
    }
}

// 删除排名数据
export async function deleteRankingFromDatabase(
    universityName: string,
    source: string
): Promise<void> {
    try {
        const deleteQuery = `
            DELETE FROM RankingMetric
            WHERE universityName = ? AND source = ?;
        `;
        const [result]: any = await pool.query(deleteQuery, [universityName, source]);

        if (result.affectedRows === 0) {
            throw new Error(`No ranking data found for universityName=${universityName} and source=${source}.`);
        }
    } catch (error) {
        console.error("Error in deleteRankingFromDatabase:", error);
        throw error;
    }
}


// 更新排名数据
export async function updateRankingInDatabase(rankingData: any): Promise<void> {
    const {
        universityName,
        source,
        academicRep,
        employerRep,
        facultyStudentScore,
        citationPerFaculty,
        internationalScore,
    } = rankingData;

    try {
        const updateQuery = `
            UPDATE RankingMetric
            SET 
                academicRep = ?,
                employerRep = ?,
                facultyStudentScore = ?,
                citationPerFaculty = ?,
                internationalScore = ?
            WHERE 
                universityName = ? AND source = ?;
        `;

        const [result]: any = await pool.query(updateQuery, [
            academicRep,
            employerRep,
            facultyStudentScore,
            citationPerFaculty,
            internationalScore,
            universityName,
            source,
        ]);

        if (result.affectedRows === 0) {
            throw new Error(`No ranking data found to update for universityName=${universityName} and source=${source}.`);
        }
    } catch (error) {
        console.error("Error in updateRankingInDatabase:", error);
        throw error;
    }
}

export async function getUserFavourites(userID: number): Promise<{ universityName: string }[]> {
    const sqlQuery = `SELECT universityName FROM Favourite WHERE userID = ?`;
    try {
        const [rows] = await pool.query(sqlQuery, [userID]);
        return rows as { universityName: string }[];
    } catch (error) {
        console.error("Error in getUserFavourites:", error);
        throw error;
    }
}
//     universityName: string;
//     description: string,
//     establishmentDate: string,
//     location: string,
//     country: string
//     popularity: number
//     source: string;
//     academicRep: number;
//     employerRep: number;
//     facultyStudentScore: number;
//     citationPerFaculty: number;
//     internationalScore: number;
//     livingEnvironment: number;
//     library: number;
//     restaurant: number;
//     content: string;
//     date: Date;
export async function getRankingAndCommentAndUniveristyByUniversityName(
    universityName: string,
    source?: string,
    academicRep?: number,
    employerRep?: number,
    facultyStudentScore?: number,
    citationPerFaculty?: number,
    internationalScore?: number,
    description?: string,
    establishmentDate?: string,
    location?: string,
    country?: string,
    popularity?: number,
    livingEnvironment?: number,
    learningAtmosphere?: number,
    library?: number,
    restaurant?: number,
    content?: string,
    date?: Date
): Promise<any[]> {
    let sqlQuery = `
          SELECT DISTINCT
              rm.universityName,
              rm.source,
              rm.academicRep,
              rm.employerRep,
              rm.facultyStudentScore,
              rm.citationPerFaculty,
              rm.internationalScore,
              u.description,
              u.establishmentDate,
              u.location,
              u.country,
              u.popularity,
              c.livingEnvironment,
              c.learningAtmosphere,
              c.library,
              c.restaurant,
              c.content,
              c.date
          FROM
              University u
          LEFT JOIN
              RankingMetric rm
          ON
              rm.universityName = u.universityName
          LEFT JOIN
              Comment c
          ON
              u.universityName = c.universityName
          WHERE
              u.universityName LIKE ?
        ${source ? "AND rm.source = ?" : ""}
        ${academicRep ? "AND rm.academicRep = ?" : ""}
        ${employerRep ? "AND rm.employerRep = ?" : ""}
        ${facultyStudentScore ? "AND rm.facultyStudentScore = ?" : ""}
        ${citationPerFaculty ? "AND rm.citationPerFaculty = ?" : ""}
        ${internationalScore ? "AND rm.internationalScore = ?" : ""}
        ${description ? "AND u.description LIKE ?" : ""}
        ${establishmentDate ? "AND u.establishmentDate LIKE ?" : ""}
        ${location ? "AND u.location LIKE ?" : ""}
        ${country ? "AND u.country LIKE ?" : ""}
        ${popularity ? "AND u.popularity = ?" : ""}
        ${livingEnvironment ? "AND c.livingEnvironment = ?" : ""}
        ${learningAtmosphere ? "AND c.learningAtmosphere = ?" : ""}
        ${library ? "AND c.library = ?" : ""}
        ${restaurant ? "AND c.restaurant = ?" : ""}
        ${content ? "AND c.content LIKE ?" : ""}
        
    `;

    const queryParams = [`%${universityName}%`];
    if (source) queryParams.push(source);
    if (academicRep) queryParams.push(academicRep.toString());
    if (employerRep) queryParams.push(employerRep.toString());
    if (facultyStudentScore) queryParams.push(facultyStudentScore.toString());
    if (citationPerFaculty) queryParams.push(citationPerFaculty.toString());
    if (internationalScore) queryParams.push(internationalScore.toString());
    if (description) queryParams.push(`%${description}%`);
    if (establishmentDate) queryParams.push(`%${establishmentDate}%`);
    if (location) queryParams.push(`%${location}%`);
    if (country) queryParams.push(`%${country}%`);
    if (popularity) queryParams.push(popularity.toString());
    if (livingEnvironment) queryParams.push(livingEnvironment.toString());
    if (learningAtmosphere) queryParams.push(learningAtmosphere.toString());
    if (library) queryParams.push(library.toString());
    if (restaurant) queryParams.push(restaurant.toString());
    if (content) queryParams.push(`%${content}%`);
    if (date) { queryParams.push(date.toISOString().split('T')[0]); }

    try {
        console.log("Executing Query:", sqlQuery);
        console.log("With Parameters:", queryParams);
        const [rows] = await pool.query(sqlQuery, queryParams);
        return rows as any[];
    } catch (error) {
        console.error("Error in getRankingAndCommentAndUniversityByUniversityName:", error);
        throw error;
    }
}

export async function getPopularUniversities():Promise<University[]> {
    const sqlQuery = `SELECT * FROM University ORDER BY popularity DESC LIMIT 15;`;
    const [rows] = await pool.query(sqlQuery);
    return rows as University[];
}