import { AdmissionData } from "../models/AdmissionData";
import pool from "./connection";
import { RowDataPacket } from "mysql2";
import { ResultSetHeader } from "mysql2/promise";

export async function keywordSearch(keywords: string[]): Promise<AdmissionData[]> {
    const keywordString = keywords.join(' ');
    const [rows] = await pool.query('CALL SearchAdmissionData(?)', [keywordString]);
    return (rows as AdmissionData[][])[0];
}

export async function getAdmission(Id: number): Promise<AdmissionData> {
    const [rows] = await pool.query('SELECT * FROM AdmissionData WHERE adID = (?)', [Id]);
    const data = rows as AdmissionData[]
    return data[0] || null;
}

export async function addAdmission(admission: Omit<AdmissionData, 'adID'>): Promise<boolean> {
    const sqlQuery = `INSERT INTO AdmissionData (universityName, program, admissionSeason, notificationTime, GPA, languageProficiencyType, languageScore, 
    GRE, Notes, userID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    try {
        await pool.query(sqlQuery, [admission.universityName, admission.program, admission.admissionSeason, admission.notificationTime, admission.GPA, admission.languageProficiencyType, admission.languageScore, admission.GRE, admission.Notes, admission.userID]);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function deleteAdmission(Id: number): Promise<boolean> {
    const sqlQuery = `DELETE FROM AdmissionData WHERE adID = (?)`;
    try {
        await pool.query(sqlQuery,[Id]);
        return true;
    }
    catch (error) {
        console.error(error)
        return false;
    }
}

export async function updateAdmission(data: AdmissionData): Promise<boolean> {
    const sqlQuery = `UPDATE AdmissionData SET universityName = ?,program = ?,admissionSeason = ?,notificationTime = ?,GPA = ?,languageProficiencyType = ?,
    languageScore = ?, GRE = ?, Notes = ?,userID = ?WHERE adID = ?`;
    try {
        await pool.query(sqlQuery, [data.universityName, data.program, data.admissionSeason, data.notificationTime, data.GPA, data.languageProficiencyType, 
            data.languageScore, data.GRE, data.Notes, data.userID,data.adID]);
        return true;
    }
    catch (error) {
        console.error(error)
        return false;
    }
}

export async function getAdmissionDataByUser(userID:number):Promise<AdmissionData[]> {
    const sqlQuery = `SELECT * FROM AdmissionData WHERE userID = (?)`;
    const [rows] = await pool.query(sqlQuery, [userID]);
    return rows as AdmissionData[];
}
