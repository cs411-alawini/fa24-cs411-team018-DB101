import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3007";

// 搜索大学排名
export const searchRankings = (keyword: string, country?: string) => {
    return axios.get(`${BASE_URL}/api/ranking/search`, {
        params: { keyword, country },
    });
};

// 添加收藏
export const addFavouriteAPI = (userID: number, universityName: string) => {
    return axios.post(`${BASE_URL}/api/ranking/favourite`, { userID, universityName });
};

// 取消收藏
export const removeFavouriteAPI = (userID: number, universityName: string) => {
    return axios.delete(`${BASE_URL}/api/ranking/favourite`, {
        data: { userID, universityName },
    });
};

// 检查是否已收藏（可选，如果需要动态检查）
export const isFavouriteAPI = (userID: number, universityName: string) => {
    return axios.get(`${BASE_URL}/api/ranking/favourite`, {
        params: { userID, universityName },
    });
};
