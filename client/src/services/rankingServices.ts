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


export const removeFavouriteAPI = (userID: number, universityName: string) => {
    return axios.delete(`${BASE_URL}/api/ranking/favourite`, {
        params: { userID, universityName }, // 通过 query 参数发送
    });
};




// 检查是否已收藏
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
//添加排名数据
export const addRankingData = async (rankingData: any) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/ranking/add`, rankingData);
        console.log("Response from server:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error in addRankingData:", error);
        throw error; 
    }
};
// 删除排名数据
export const deleteRankingData = async (universityName: string, source: string) => {
    const response = await axios.delete(`${BASE_URL}/api/ranking/delete`, {
        data: { universityName, source },
    });
    return response.data;
};

// 更新排名数据
export const updateRankingData = async (rankingData: any) => {
    const response = await axios.put(`${BASE_URL}/api/ranking/update`, rankingData);
    return response.data;
};

export const filterRankings = (
    keyword?: string,
    country?: string,
    source?: string,
    academicRepFilter?: string,
    employerRepFilter?: string,
    facultyStudentFilter?: string,
    citationPerFacultyFilter?: string,
    internationalScoreFilter?: string
) => {
    return axios.post(`${BASE_URL}/api/ranking/filter-ranking`, {
        keyword,
        country,
        source,
        academicRepFilter,
        employerRepFilter,
        facultyStudentFilter,
        citationPerFacultyFilter,
        internationalScoreFilter,
    });
};


