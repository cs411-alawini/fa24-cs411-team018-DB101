import React, { useState, useEffect } from "react";
import {
    searchRankings,
    isFavouriteAPI,
    addFavouriteAPI,
    removeFavouriteAPI,
    getCountries,
    addRankingData,
    deleteRankingData,
    updateRankingData,
    filterRankings
    
} from "../services/rankingServices";
import { useNavigate } from "react-router-dom";

const RankingPage: React.FC = () => {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState<string>(""); // 搜索关键词
    const [source, setSource] = useState<string>(""); // 来源筛选
    const [country, setCountry] = useState<string>(""); // 国家筛选
    const [academicRepFilter, setAcademicRepFilter] = useState<string>(""); // Academic Rep 筛选
    const [rankings, setRankings] = useState<any[]>([]); // 排名数据
    const [countries, setCountries] = useState<string[]>([]); // 国家列表
    const [alert, setAlert] = useState<string | null>(null); // 提示信息
    const [page, setPage] = useState<number>(1); // 当前页数
    const itemsPerPage = 100; // 每页显示的条目数
    const userID = Number(localStorage.getItem("userID")); // 假设用户已登录并存储了 userID
    const isAdmin = userID === 511; // 判断是否是管理员
    const [showAddModal, setShowAddModal] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null); // 控制弹窗的消息
    const [showAlert, setShowAlert] = useState(false); // 是否显示弹窗
    const [showEditModal, setShowEditModal] = useState(false); // 控制编辑弹窗
    const [editingRanking, setEditingRanking] = useState<any>(null); // 当前编辑的数据

    const [newRanking, setNewRanking] = useState({
        universityName: "",
        source: "QS",
        academicRep: "",
        employerRep: "",
        facultyStudentScore: "",
        citationPerFaculty: "",
        internationalScore: "",
        location: "",
        country: "",
    });
     
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

    // const userID = Number(localStorage.getItem("userID"));

    useEffect(() => {
        if (!userID) {
            setAlert("User not logged in. Please log in to use this feature.");
        }
    }, [userID]);

    if (!userID) {
        return <div>Please log in to use this feature.</div>; // 或者跳转到登录页面
    }

    
    const handleEdit = (ranking: any) => {
        setEditingRanking(ranking); // 设置要编辑的数据
        setShowEditModal(true); // 打开编辑弹窗
    };
    
    const handleClear = () => {
        // 清空所有筛选条件
        setKeyword("");
        setCountry("");
        setSource("");
        setAcademicRepFilter("");
        setRankings([]); // 清空当前显示的结果
    };

    const handleAddRanking = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log("TBH1");
            await addRankingData(newRanking); // 调用后端 API 提交数据
            console.log("TBH2");
            setShowAddModal(false); // 关闭弹框
            setNewRanking({
                universityName: "",
                source: "QS",
                academicRep: "",
                employerRep: "",
                facultyStudentScore: "",
                citationPerFaculty: "",
                internationalScore: "",
                location: "",
                country: "",
            }); // 重置表单
            handleSearch(); // 刷新表格数据
        } catch (error) {
            setShowAddModal(false); 
            console.log("89898989");
            const errorMessage = "University does not exist. Please go to add the university before adding rankings.";
            setAlertMessage(errorMessage);
            setShowAlert(true); // 显示弹窗
        }
    };
    
    const handleCloseAlert = () => {
        setShowAlert(false);
        setAlertMessage(null);
    };
    const handleSearch = async () => {
        try {
            const response = await filterRankings(keyword, country, source, academicRepFilter);
            const rankingData = response.data.data || [];
    
            // 检查每个大学是否已被收藏
            const updatedRankings = await Promise.all(
                rankingData.map(async (item: any) => {
                    const favouriteResponse = await isFavouriteAPI(userID, item.universityName);
                    return {
                        ...item,
                        isFavourite: favouriteResponse.data.favourite || false,
                        isLoading: false, // 加载状态
                    };
                })
            );
    
            setRankings(updatedRankings);
            setPage(1); // 重置页码
        } catch (error) {
            console.error("Error searching rankings:", error);
            setAlert("Failed to fetch rankings. Please try again.");
        }
    };

    const toggleFavourite = async (universityName: string, isFavourite: boolean) => {
        if (!userID || !universityName) {
            console.error("Missing userID or universityName");
            setAlert("Invalid user or university information.");
            return;
        }
    
        try {
            if (isFavourite) {
                await removeFavouriteAPI(userID, universityName);
            } else {
                try {
                    await addFavouriteAPI(userID, universityName);
                } catch (error: any) {
                    if (error.response?.status === 409) {
                        console.warn("Record already exists");
                    } else {
                        throw error;
                    }
                }
            }
    
            // 更新本地状态
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
    

    const loadMore = () => {
        setPage((prevPage) => prevPage + 1); // 增加页码
    };
    const handleDelete = async (universityName: string, source: string) => {
        if (window.confirm("Are you sure you want to delete this ranking?")) {
            try {
                await deleteRankingData(universityName, source); // 调用后端 API
                setAlertMessage("Ranking deleted successfully!");
                setShowAlert(true);
                handleSearch(); // 重新加载数据
            } catch (error) {
                console.error("Error deleting ranking:", error);
                setAlertMessage("Failed to delete ranking.");
                setShowAlert(true);
            }
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateRankingData(editingRanking); // 调用后端 API
            setShowEditModal(false); // 关闭弹窗
            setAlertMessage("Ranking updated successfully!");
            setShowAlert(true);
            handleSearch(); // 刷新表格数据
        } catch (error) {
            console.error("Error updating ranking data:", error);
            setAlertMessage("Failed to update ranking.");
            setShowAlert(true);
        }
    };
    
    const handleEditRanking = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateRankingData(editingRanking); // 调用后端 API 更新数据
            setShowEditModal(false); // 关闭弹框
            handleSearch(); // 刷新表格数据
        } catch (error) {
            setShowEditModal(false); // 关闭弹框
            console.error("Error updating ranking data:", error);
            setAlertMessage("Failed to update ranking data.");
            setShowAlert(true); // 显示错误弹窗
        }
    };
    
    

    const displayedRankings = rankings.slice(0, page * itemsPerPage);

    return (
        
        <div className="p-6">
            {/* 返回按钮 */}
            <button
                onClick={() => navigate('/home')}
                className="absolute top-2 left-4 text-blue-500 hover:text-blue-600 font-bold flex items-center"
            >
                ← Back to Home
            </button>
            <h2 className="text-2xl font-bold mb-4">University Rankings</h2>
            {/* 弹窗组件 */}
            {showAlert && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-md">
                        <p>{alertMessage}</p>
                        <button
                            onClick={handleCloseAlert}
                            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
            {alert && (
                <div className="mb-4 p-2 bg-yellow-100 text-yellow-700 rounded">
                    {alert}
                </div>
            )}

            <div className="mb-4">
                {/* 搜索关键词输入框 */}
                <input
                    type="text"
                    placeholder="Search by keyword"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="p-2 border rounded w-full mb-2"
                />

                <div className="mb-4">
                    {/* 国家筛选下拉框 */}
                    <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="p-2 border rounded w-full mb-2"
                    >
                        <option value="">All Countries</option>
                        {countries.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>

                    {/* 来源筛选下拉框 */}
                    <select
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="p-2 border rounded w-full mb-2"
                    >
                        <option value="">All Sources</option>
                        <option value="QS">QS</option>
                        <option value="Times">Times</option>
                    </select>

                    {/* Academic Rep 筛选下拉框 */}
                    <select
                        value={academicRepFilter}
                        onChange={(e) => setAcademicRepFilter(e.target.value)}
                        className="p-2 border rounded w-full"
                    >
                        <option value="">All Academic Rep</option>
                        <option value="<30">{"< 30"}</option>
                        <option value="30-60">30 - 60</option>
                        <option value=">60">{"> 60"}</option>
                    </select>
                </div>

            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                    Search
                </button>
                <button
                    onClick={handleClear}
                    className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                    Clear
                </button>
                {isAdmin && (
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                    Add Ranking Data
                </button>
    )}
                
            </div>


            <div className="mt-6">
    {displayedRankings.length > 0 ? (
        <table className="w-full border-collapse border border-gray-200">
            <thead>
                <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">University Name</th>
                    <th className="border border-gray-300 px-4 py-2">Source</th>
                    <th className="border border-gray-300 px-4 py-2">Academic Rep</th>
                    <th className="border border-gray-300 px-4 py-2">Employer Rep</th>
                    <th className="border border-gray-300 px-4 py-2">Faculty/Student</th>
                    <th className="border border-gray-300 px-4 py-2">Citation/Faculty</th>
                    <th className="border border-gray-300 px-4 py-2">International Score</th>
                    <th className="border border-gray-300 px-4 py-2">Location</th>
                    <th className="border border-gray-300 px-4 py-2">Country</th>
                    <th className="border border-gray-300 px-4 py-2">
                        {isAdmin ? "Action" : "Favourite"}
                    </th>
                </tr>
            </thead>
            <tbody>
                {displayedRankings.map((ranking, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{ranking.universityName || "N/A"}</td>
                        <td className="border border-gray-300 px-4 py-2">{ranking.source}</td>
                        <td className="border border-gray-300 px-4 py-2">{ranking.academicRep}</td>
                        <td className="border border-gray-300 px-4 py-2">{ranking.employerRep}</td>
                        <td className="border border-gray-300 px-4 py-2">{ranking.facultyStudentScore}</td>
                        <td className="border border-gray-300 px-4 py-2">{ranking.citationPerFaculty}</td>
                        <td className="border border-gray-300 px-4 py-2">{ranking.internationalScore}</td>
                        <td className="border border-gray-300 px-4 py-2">{ranking.location}</td>
                        <td className="border border-gray-300 px-4 py-2">{ranking.country}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                        <td className="border border-gray-300 px-4 py-2 text-center">
                            {isAdmin ? (
                                <div className="flex gap-2 justify-center">
                                    <button
                                        onClick={() => handleEdit(ranking)}
                                        className="bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ranking.universityName, ranking.source)}
                                        className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => toggleFavourite(ranking.universityName, ranking.isFavourite)}
                                >
                                    {ranking.isFavourite ? "💖" : "🤍"}
                                </button>
                            )}
                        </td>

                    </td>

                    </tr>
                ))}
            </tbody>
        </table>
    ) : (
        <p>No results found.</p>
    )}
</div>


            {displayedRankings.length < rankings.length && (
                <button onClick={loadMore}>Load More</button>
            )}
            {showEditModal && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Edit Ranking Data</h2>
            <form onSubmit={handleEditRanking}>
                <div className="mb-4">
                    <label className="block font-medium mb-1">University Name</label>
                    <input
                        type="text"
                        value={editingRanking.universityName}
                        readOnly
                        className="w-full p-2 border rounded bg-gray-100"
                    />
                </div>
                <div className="mb-4">
                    <label className="block font-medium mb-1">Source</label>
                    <select
                        value={editingRanking.source}
                        onChange={(e) =>
                            setEditingRanking({ ...editingRanking, source: e.target.value })
                        }
                        className="w-full p-2 border rounded"
                    >
                        <option value="QS">QS</option>
                        <option value="Times">Times</option>
                    </select>
                </div>
                {[
                    { label: "Academic Rep", key: "academicRep" },
                    { label: "Employer Rep", key: "employerRep" },
                    { label: "Faculty/Student", key: "facultyStudentScore" },
                    { label: "Citation/Faculty", key: "citationPerFaculty" },
                    { label: "International Score", key: "internationalScore" },
                    { label: "Location", key: "location" },
                    { label: "Country", key: "country" },
                ].map((field) => (
                    <div className="mb-4" key={field.key}>
                        <label className="block font-medium mb-1">{field.label}</label>
                        <input
                            type="text"
                            value={editingRanking[field.key]}
                            onChange={(e) =>
                                setEditingRanking({ ...editingRanking, [field.key]: e.target.value })
                            }
                            className="w-full p-2 border rounded"
                        />
                    </div>
                ))}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="bg-gray-500 text-white py-2 px-4 rounded mr-2 hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    </div>
)}


            {showAddModal && (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow-md w-1/2">
            <h2 className="text-xl font-bold mb-4">Add Ranking Data</h2>
            <form onSubmit={handleAddRanking}>
                {/* University Name */}
                <div className="mb-4">
                    <label className="block text-gray-700">University Name:</label>
                    <input
                        type="text"
                        value={newRanking.universityName}
                        onChange={(e) =>
                            setNewRanking({ ...newRanking, universityName: e.target.value })
                        }
                        className="p-2 border rounded w-full"
                        required
                    />
                </div>

                {/* Source */}
                <div className="mb-4">
                    <label className="block text-gray-700">Source:</label>
                    <select
                        value={newRanking.source}
                        onChange={(e) =>
                            setNewRanking({ ...newRanking, source: e.target.value })
                        }
                        className="p-2 border rounded w-full"
                        required
                    >
                        <option value="QS">QS</option>
                        <option value="Times">Times</option>
                    </select>
                </div>

                {/* Academic Rep */}
                <div className="mb-4">
                    <label className="block text-gray-700">Academic Rep:</label>
                    <input
                        type="number"
                        value={newRanking.academicRep}
                        onChange={(e) =>
                            setNewRanking({ ...newRanking, academicRep: e.target.value })
                        }
                        className="p-2 border rounded w-full"
                        required
                    />
                </div>

                {/* Employer Rep */}
                <div className="mb-4">
                    <label className="block text-gray-700">Employer Rep:</label>
                    <input
                        type="number"
                        value={newRanking.employerRep}
                        onChange={(e) =>
                            setNewRanking({ ...newRanking, employerRep: e.target.value })
                        }
                        className="p-2 border rounded w-full"
                        required
                    />
                </div>

                {/* Faculty/Student */}
                <div className="mb-4">
                    <label className="block text-gray-700">Faculty/Student:</label>
                    <input
                        type="number"
                        value={newRanking.facultyStudentScore}
                        onChange={(e) =>
                            setNewRanking({ ...newRanking, facultyStudentScore: e.target.value })
                        }
                        className="p-2 border rounded w-full"
                        required
                    />
                </div>

                {/* Citation/Faculty */}
                <div className="mb-4">
                    <label className="block text-gray-700">Citation/Faculty:</label>
                    <input
                        type="number"
                        value={newRanking.citationPerFaculty}
                        onChange={(e) =>
                            setNewRanking({ ...newRanking, citationPerFaculty: e.target.value })
                        }
                        className="p-2 border rounded w-full"
                        required
                    />
                </div>

                {/* International Score */}
                <div className="mb-4">
                    <label className="block text-gray-700">International Score:</label>
                    <input
                        type="number"
                        value={newRanking.internationalScore}
                        onChange={(e) =>
                            setNewRanking({ ...newRanking, internationalScore: e.target.value })
                        }
                        className="p-2 border rounded w-full"
                        required
                    />
                </div>

                {/* Location */}
                <div className="mb-4">
                    <label className="block text-gray-700">Location:</label>
                    <input
                        type="text"
                        value={newRanking.location}
                        onChange={(e) =>
                            setNewRanking({ ...newRanking, location: e.target.value })
                        }
                        className="p-2 border rounded w-full"
                        required
                    />
                </div>

                {/* Country */}
                <div className="mb-4">
                    <label className="block text-gray-700">Country:</label>
                    <input
                        type="text"
                        value={newRanking.country}
                        onChange={(e) =>
                            setNewRanking({ ...newRanking, country: e.target.value })
                        }
                        className="p-2 border rounded w-full"
                        required
                    />
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    >
                        Submit
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
)}

        </div>
        
    );
};

export default RankingPage;