import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3007";

export const getUniversityByName = async (universityName: string) => {
    const response = axios.get(`${API_BASE_URL}/api/university/${encodeURIComponent(universityName)}`);
    return response;
};

export const getAllUniversities = async () => {
    return axios.get(`${API_BASE_URL}/api/university`);
};
export interface University {
    universityName: string,
    description: string,
    establishmentDate: string,
    location: string,
    country: string,
    popularity: number
}
export const getUniversityByPopularity = async (
    popularity: number,
    UniversityName?: string,
    description?: string,
    establishmentDate?: string,
    location?: string,
    country?: string
) => {
    console.log("22222");
    const requestURL = `${API_BASE_URL}/api/university/popularity/${popularity}`;
    console.log(`Request URL: ${requestURL}`);

    return axios.get(requestURL, {
        params: { UniversityName, description, establishmentDate, country, location, popularity }, // 传递 popularity 参数
    });
}

export const createUniversity = async (university: {
    universityName: string;
    description: string;
    establishmentDate: string;
    location: string;
    country: string;
    popularity: number;
}) => {
    return axios.post(`${API_BASE_URL}/api/university`, university);
};

export const updateUniversity = async (
    universityName: string,
    updatedFields: {
        description?: string;
        establishmentDate?: string;
        location?: string;
        country?: string;
        popularity?: number;
    }
) => {
    return axios.put(`${API_BASE_URL}/api/university/${encodeURIComponent(universityName)}`, updatedFields);
};

export const deleteUniversity = async (universityName: string) => {
    return axios.delete(`${API_BASE_URL}/api/university/${encodeURIComponent(universityName)}`);
};

export const getRankingAndCommentAndUniveristyByUniversityName = async (universityName: string) => {
    try {
        return await axios.get(`${API_BASE_URL}/api/university/${encodeURIComponent(universityName)}/info`);
    } catch (error) {
        console.error("Error fetching university info:", error);
        throw error; // Rethrow the error for the caller to handle.
    }
};

export const getPopularUniversity = async () => {
    try {
        return await axios.get(`${API_BASE_URL}/api/university/popular`);
    } catch (error) {
        console.error("Error fetching university info:", error);
        throw error; // Rethrow the error for the caller to handle.
    }
}