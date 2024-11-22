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