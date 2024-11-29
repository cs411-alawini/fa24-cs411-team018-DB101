import { User } from "../models/User";
import pool from "./connection";
import { RowDataPacket } from "mysql2";

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
    keyword?: string, // 将 keyword 设置为可选参数
    countryFilter?: string // 保留 countryFilter 的可选参数
): Promise<any[]> {
    try {
        // 构建 SQL 查询的基础语句
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
            WHERE 1=1
                ${keyword ? "AND rm.universityName LIKE ?" : ""}
                ${countryFilter ? "AND u.country LIKE ?" : ""}
        `;

        // 构建查询参数
        const queryParams: string[] = [];
        if (keyword) queryParams.push(`%${keyword}%`);
        if (countryFilter) queryParams.push(`%${countryFilter}%`);

        // 执行查询
        const [rows] = await pool.query(sqlQuery, queryParams);
        return rows as any[];
    } catch (error) {
        console.error("Error in searchRanking:", error);
        throw error;
    }
}


// 添加收藏
export async function addFavourite(userID: number, universityName: string): Promise<void> {
    const sqlQuery = `INSERT INTO Favourite (userID, universityName) VALUES (?, ?)`;
    try {
        await pool.execute(sqlQuery, [userID, universityName]);
    } catch (error) {
        console.error("Error in addFavourite:", error);
        throw error;
    }
}

// 移除收藏
export async function removeFavourite(userID: number, universityName: string): Promise<void> {
    const sqlQuery = `DELETE FROM Favourite WHERE userID = ? AND universityName = ?`;
    try {
        await pool.execute(sqlQuery, [userID, universityName]);
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