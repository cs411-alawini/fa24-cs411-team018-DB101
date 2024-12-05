import { AdmissionData } from "../models/AdmissionData";
import pool from "./connection";
import { RowDataPacket } from "mysql2";
import { ResultSetHeader } from "mysql2/promise";

export async function keywordSearch(keywords: string[]): Promise<AdmissionData[]> {
    const keywordString = keywords.join(' ');
    const [rows] = await pool.query('CALL SearchAdmissionData(?)', [keywordString]);
    return (rows as AdmissionData[][])[0];
}

export async function getAdmission(Id:number): Promise<AdmissionData> {
    const [rows] = await pool.query('SELECT * FROM AdmissionData WHERE adID = (?)', [Id]);
    const data = rows as AdmissionData[]
    return data[0] || null;
}
