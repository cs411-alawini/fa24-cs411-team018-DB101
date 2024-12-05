import axios from "axios";
export interface AdmissionData{
    adID: number,
    universityName: string,
    program: string,
    admissionSeason: string,
    notificationTime: string,
    GPA: number,
    languageProficiencyType: string,
    languageScore: number,
    GRE: number,
    notes: string,
    userID: number
} 
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3007";

export const httpClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const keywordSearch = (keywords:string):Promise<AdmissionData[]> =>{
    const encodedKeywords = encodeURIComponent(keywords);
    return httpClient.get((`/api/admission/keyword?keywords=${encodedKeywords}`)).then((response)=>response.data as unknown as AdmissionData[]);
}
