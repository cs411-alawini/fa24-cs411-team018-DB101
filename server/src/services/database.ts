import { User } from "../models/User";
import { University } from "../models/University";
import { Comment } from "../models/Comment";
import pool from "./connection";
import { RowDataPacket } from "mysql2";
import { ResultSetHeader } from "mysql2/promise";

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
        SELECT universityName, description, establishment, location, country, popularity
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
export async function getUniversityByName(universityName: string): Promise<University | null> {
    const sqlQuery = `
        SELECT universityName, description, establishment, location, country, popularity
        FROM University
        WHERE universityName = ?;
    `;
    try {
        const [rows] = await pool.query<RowDataPacket[]>(sqlQuery, [universityName]);
        const universities = rows as University[];
        return universities[0] || null;
    } catch (error) {
        console.error("Error in getUniversityByName:", error);
        throw error;
    }
}

export async function getUniversityByPopularity(popularity: number): Promise<University[]> {
    const sqlQuery = `
        SELECT universityName, description, establishment, location, country, popularity
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
        INSERT INTO University (universityName, description, establishment, location, country, popularity)
        VALUES (?, ?, ?, ?, ?, ?);
    `;
    const { universityName, description, establishment, location, country, popularity } = university;
    try {
        const [result] = await pool.query<ResultSetHeader>(sqlQuery, [
            universityName,
            description,
            establishment,
            location,
            country,
            popularity
        ]);
        // Optionally, you can verify if the insert was successful by checking affectedRows
        if (result.affectedRows === 0) {
            throw new Error("Failed to create university");
        }
        return { universityName, description, establishment, location, country, popularity };
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
): Promise<University | null> {
    const allowedFields: (keyof Omit<University, 'universityName'>)[] = ['description', 'establishment', 'location', 'country', 'popularity'];
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
            return null; // University not found
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

export async function createComment(comment: Comment): Promise<Comment> {
    const sqlQuery = `INSERT INTO Comment (universityName, userId, livingEnvironment, library, restaurant, content, date) VALUES (?, ?, ?, ?, ?, ?, ?);`;
    try {
        const [result] = await pool.query<ResultSetHeader>(sqlQuery, [comment.universityName, comment.userId, comment.livingEnvironment, comment.library, comment.restaurant, comment.content, comment.date]);
        await updateUniversityPopularity(comment.universityName, 1);
        return { ...comment, commentId: result.insertId };
    } catch (error) {
        console.error("Error in createComment:", error);
        throw error;
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

