import React, { useState, useEffect } from "react";
import {
    searchRankings,
    addFavouriteAPI,
    removeFavouriteAPI,
    getCountries
    
} from "../services/rankingServices";

const RankingPage: React.FC = () => {
    const [keyword, setKeyword] = useState<string>(""); // 搜索关键词
    const [country, setCountry] = useState<string>(""); // 国家筛选
    const [rankings, setRankings] = useState<any[]>([]); // 排名数据
    const [countries, setCountries] = useState<string[]>([]); // 国家列表
    const [alert, setAlert] = useState<string | null>(null); // 提示信息
    const [page, setPage] = useState<number>(1); // 当前页数
    const itemsPerPage = 100; // 每页显示的条目数

    const userID = Number(localStorage.getItem("userID")); // 假设用户已登录并存储了 userID

    // 加载国家列表
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await getCountries();
                const fetchedCountries = response.data.data || [];
                const validCountries = fetchedCountries
                    .filter((item: { country: string | null }) => item.country) // 过滤掉 `null`
                    .map((item: { country: string | null }) => item.country as string); // 提取字段并断言为字符串
                setCountries(validCountries); // 设置过滤后的国家列表
            } catch (error) {
                console.error("Error fetching countries:", error);
                setAlert("Failed to fetch countries. Please try again.");
            }
        };
        fetchCountries();
    }, []);
    
    

    const handleSearch = async () => {
        console.log("Search button clicked");
        try {
            const response = await searchRankings(keyword, country);
            console.log("API Response:", JSON.stringify(response.data, null, 2));
            const rankingData = response.data.data; // 提取嵌套的 data 数组
            setRankings(
                Array.isArray(rankingData)
                    ? rankingData.map((item) => ({ ...item, isFavourite: false }))
                    : []
            ); // 确保是数组，并初始化收藏状态
            setPage(1); // 重置页码为1
        } catch (error) {
            console.error("Error searching rankings:", error);
            setAlert("Failed to fetch rankings. Please try again.");
        }
    };

    const loadMore = () => {
        setPage((prevPage) => prevPage + 1); // 增加页码
    };

    const toggleFavourite = async (universityName: string, isFavourite: boolean) => {
        try {
            if (isFavourite) {
                await removeFavouriteAPI(userID, universityName);
            } else {
                await addFavouriteAPI(userID, universityName);
            }
            setRankings((prevRankings) =>
                prevRankings.map((ranking) =>
                    ranking.universityName === universityName
                        ? { ...ranking, isFavourite: !isFavourite }
                        : ranking
                )
            );
        } catch (error) {
            console.error("Error toggling favourite:", error);
            setAlert("Failed to update favourite. Please try again.");
        }
    };

    const displayedRankings = rankings.slice(0, page * itemsPerPage);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">University Rankings</h2>

            {alert && (
                <div className="mb-4 p-2 bg-yellow-100 text-yellow-700 rounded">
                    {alert}
                </div>
            )}

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by keyword"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="p-2 border rounded w-full mb-2"
                />

                {/* 国家下拉框 */}
                <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="p-2 border rounded w-full"
                >
                    <option value="">All Countries</option>
                    {countries.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>
            <button
                onClick={handleSearch}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
                Search
            </button>

            <div className="mt-6">
                {displayedRankings.length > 0 ? (
                    <ul>
                        {displayedRankings.map((ranking, index) => (
                            <li key={index}>
                                <div>{ranking.universityName || "N/A"}</div>
                                <button
                                    onClick={() =>
                                        toggleFavourite(
                                            ranking.universityName,
                                            ranking.isFavourite
                                        )
                                    }
                                >
                                    {ranking.isFavourite ? "💖" : "🤍"}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No results found.</p>
                )}
            </div>

            {displayedRankings.length < rankings.length && (
                <button onClick={loadMore}>Load More</button>
            )}
        </div>
    );
};

export default RankingPage;