import { Router, Request, Response } from "express";
import { searchRanking, addFavourite, removeFavourite, isFavourite,getCountriesFromDatabase, filterRankingWithTransaction,addRankingToDatabase,updateRankingInDatabase,deleteRankingFromDatabase } from "../services/database";
import { log } from "console";


const router = Router();






//创建API获取国家列表
router.get("/countries", async (req: Request, res: Response) => {
    try {
        console.log('th11111');
        const countries = await getCountriesFromDatabase(); // 假设从数据库查询国家列表
        res.json({ success: true, data: countries });
      } catch (error) {
        console.log('th22222');
        console.error("Error fetching countries:", error);
        res.status(500).json({ success: false, message: "Failed to fetch countries" });
      } 
});

router.post("/favourite", async (req: Request, res: Response) => {
    const { userID, universityName } = req.body;

    if (!userID || !universityName) {
        console.error("POST /favourite: Missing parameters", req.body);
        res.status(400).json({ success: false, message: "UserID and universityName are required" });
    }

    try {
        await addFavourite(Number(userID), universityName);
        console.log(`Added favourite: userID=${userID}, universityName=${universityName}`);
        res.status(200).json({ success: true, message: "Added to favourites" });
    } catch (error: any) {
        if (error.message.includes("Record already exists")) {
            res.status(409).json({ success: false, message: "Record already exists" }); // 返回冲突状态码
        } else {
            console.error("Error in addFavourite:", error);
            res.status(500).json({ success: false, message: "Failed to add to favourites" });
        }
    }
});

router.delete("/favourite", async (req: Request, res: Response) => {
    console.log("Received DELETE request with:", req.query, req.body); // 打印收到的参数
    const { userID, universityName } = req.query; // 从 query 中解析参数

    if (!userID || !universityName) {
        console.error("DELETE /favourite: Missing parameters", req.query || req.body);
        res.status(400).json({ success: false, message: "UserID and universityName are required" });
    }

    try {
        console.log(`Attempting to delete: userID=${userID}, universityName=${universityName}`);
        await removeFavourite(Number(userID), universityName as string);
        console.log(`Successfully removed: userID=${userID}, universityName=${universityName}`);
        res.status(200).json({ success: true, message: "Removed from favourites" });
    } catch (error) {
        console.error("Error in removeFavourite:", error);
        res.status(500).json({ success: false, message: "Failed to remove from favourites" });
    }
});


// 检查是否已收藏
router.get("/favourite", async (req: Request, res: Response) => {
    const { userID, universityName } = req.query;

    // 验证参数
    if (!userID || typeof Number(userID) !== "number" || !universityName || typeof universityName !== "string") {
        res.status(400).json({ success: false, message: "Invalid or missing parameters: userID and universityName are required." });
    }

    try {
        const favourite = await isFavourite(Number(userID), universityName as string);
        console.log(`Checked favourite: userID=${userID}, universityName=${universityName}, isFavourite=${favourite}`);
        res.status(200).json({ success: true, favourite });
    } catch (error) {
        console.error("Error in isFavourite:", error);
        res.status(500).json({ success: false, message: "Failed to check favourite status." });
    }
});

router.post("/add", async (req: Request, res: Response) => {
    const {
        universityName,
        source,
        academicRep,
        employerRep,
        facultyStudentScore,
        citationPerFaculty,
        internationalScore,
    } = req.body;

    try {
        // 调用 addRankingToDatabase 函数
        await addRankingToDatabase({
            universityName,
            source,
            academicRep: Number(academicRep),
            employerRep: Number(employerRep),
            facultyStudentScore: Number(facultyStudentScore),
            citationPerFaculty: Number(citationPerFaculty),
            internationalScore: Number(internationalScore),
        });

        res.status(200).json({ success: true, message: "Ranking data added successfully." });
    } catch (error) {
        console.error("Error in /add:", error);
        res.status(500).json({ success: false, message: "Failed to add ranking data." });
    }
}); 

// 删除排名数据
router.delete("/delete", async (req: Request, res: Response) => {
    const { universityName, source } = req.body;

    try {
        console.log("+++++*****");
        await deleteRankingFromDatabase(universityName, source);
        res.status(200).json({ success: true, message: "Ranking deleted successfully." });
    } catch (error) {
        console.error("Error in /delete:", error);
        res.status(500).json({ success: false, message: "Failed to delete ranking." });
    }
});

// 更新排名数据
router.put("/update", async (req: Request, res: Response) => {
    try {
        await updateRankingInDatabase(req.body);
        res.status(200).json({ success: true, message: "Ranking updated successfully." });
    } catch (error) {
        console.error("Error in /update:", error);
        res.status(500).json({ success: false, message: "Failed to update ranking." });
    }
});


router.post('/filter-ranking', async (req: Request, res: Response) => {
    const { 
        keyword, 
        country, 
        source, 
        academicRepFilter, 
        employerRepFilter, 
        facultyStudentFilter, 
        citationPerFacultyFilter, 
        internationalScoreFilter 
    } = req.body;

    try {
        const rankings = await filterRankingWithTransaction({
            keyword: keyword || null,
            country: country || null,
            source: source || null,
            academicRepFilter: academicRepFilter || null,
            employerRepFilter: employerRepFilter || null,
            facultyStudentFilter: facultyStudentFilter || null,
            citationPerFacultyFilter: citationPerFacultyFilter || null,
            internationalScoreFilter: internationalScoreFilter || null,
        });

        res.status(200).json({ success: true, data: rankings });
    } catch (error) {
        console.error('Error in /filter-ranking:', error);
        res.status(500).json({ success: false, message: 'Failed to filter rankings.' });
    }
});



export default router;
