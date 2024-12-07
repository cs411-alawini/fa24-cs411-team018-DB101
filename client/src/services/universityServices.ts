import axios from 'axios';


const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3007";

export const getUniversityByName = async (name: string) => {
    const response = await axios.get(`${BASE_URL}/api/universities/name/${name}`);
    return response.data;
};

export const getUniversityByPopularity = async (popularity: number) => {
    const response = await axios.get(`/api/universities/popularity/${popularity}`);
    return response.data;
};
