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
    Notes: string,
    userID: number
} 

export interface AnalysisResult{
    universityName: string,
    program: string,
    avgGPA: number,
    totalAdmissions:number
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

export const postNewData = (newData:Omit<AdmissionData,'adID'>):Promise<any>=>{
    return httpClient.post(`/api/admission/`,newData).then((response)=>response.data);
}

export const getDataByUser = (userID:string):Promise<any> => {
    return httpClient.get(`/api/admission/user/${userID}`).then(response => response.data as unknown as AdmissionData[]);
}

export const getAdmissionData = (adID:string):Promise<any> => {
    return httpClient.get(`/api/admission/${adID}`).then(response => response.data as unknown as AdmissionData[]);
}

export const deleteAdmissionData = (adID:string) :Promise<any>=>{
    return httpClient.delete(`/api/admission/${adID}`).then(response=>response.data);
}

export const updateAdmissionData = (newData: AdmissionData):Promise<any> =>{
    return httpClient.patch(`/api/admission`,newData).then(response=>response.data);
}

export const getCountries = ():Promise<any> =>{
    return httpClient.get(`/api/admission/country`).then(response=>response.data);
}

export const getPrograms = ():Promise<any> =>{
    return httpClient.get(`/api/admission/program`).then(response=>response.data);
}

export const analyze = (GPA:number,country:string,program:string,analyzeType:number) : Promise<any[]> =>{
    const gpa = encodeURIComponent(GPA);
    const c = encodeURIComponent(country);
    const p = encodeURI(program);
    return httpClient.get(`/api/admission/?GPA=${gpa}&country=${c}&program=${p}&analyzeType=${analyzeType}`).then(response=>response.data as unknown as AnalysisResult[]);

}