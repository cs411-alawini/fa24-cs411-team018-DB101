import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3007";

// 搜索大学排名
export const searchRankings = (
    keyword?: string,
    country?: string,
    source?: string,
    academicRepFilter?: string
) => {
    console.log("11111");
    const requestURL = `${BASE_URL}/api/ranking/search`;
    console.log(`Request URL: ${requestURL}`); // 打印请求路径

    return axios.get(requestURL, {
        params: { keyword, country, source, academicRepFilter }, // 传递 academicRepFilter 参数
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

// 获取国家列表
export const getCountries = () => {
    const requestURL = `${BASE_URL}/api/ranking/countries`;
    console.log(`Request URL: ${requestURL}`); // 打印请求路径
    return axios.get(requestURL);
};