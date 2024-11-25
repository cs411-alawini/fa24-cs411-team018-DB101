import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3007";

// 添加收藏
export const addFavourite = (userID: number, universityName: string) => {
    return axios.post(`${BASE_URL}/api/favourites`, { userID, universityName });
};
